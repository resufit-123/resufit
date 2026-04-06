import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getPriceId, detectCurrency } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { CheckoutRequest } from "@/types";

// POST /api/checkout
// Creates a Stripe Checkout session and returns the URL.
// Requires authentication — entitlement is written by the webhook, NOT here.

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const ip = getClientIp(request);
  const { success: rateLimitOk } = await checkRateLimit(`checkout:${ip}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // 2. Authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // 3. Parse body
  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { plan, optimizationId, email, marketingOptIn } = body;

  const validPlans = ["one_time", "pro", "annual"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  // 4. Detect currency from Vercel's geo header
  const countryCode = request.headers.get("x-vercel-ip-country");
  const currency = detectCurrency(countryCode);

  // 5. Resolve the correct Stripe Price ID
  let priceId: string;
  try {
    priceId = getPriceId(plan, currency);
  } catch (err) {
    console.error("Price ID lookup failed:", err);
    return NextResponse.json({ error: "Pricing configuration error." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const isSubscription = plan === "pro" || plan === "annual";

  // 6. Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email || user.email,
    success_url: `${appUrl}/results/${optimizationId ?? ""}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?cancelled=true`,
    allow_promotion_codes: true,
    // Pre-fill email to reduce friction
    ...(email && { customer_email: email }),
    // Pass metadata so the webhook can write the entitlement
    metadata: {
      user_id: user.id,
      plan,
      optimization_id: optimizationId ?? "",
      marketing_opt_in: marketingOptIn ? "true" : "false",
    },
    ...(isSubscription && {
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
        },
      },
    }),
    // Payment method config — Apple Pay, Google Pay, Link all enabled by default
    payment_method_types: ["card"],
    payment_method_options: {
      card: {
        request_three_d_secure: "automatic",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
