import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getPriceId, detectCurrency } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { CheckoutRequest } from "@/types";

// POST /api/checkout
// One-time ($5): no auth required — guest checkout, entitlement validated via Stripe session ID.
// Pro / Annual: auth required — entitlement written by Stripe webhook to subscriptions table.

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const ip = getClientIp(request);
  const { success: rateLimitOk } = await checkRateLimit(`checkout:${ip}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // 2. Parse body first — plan determines whether auth is required
  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { plan, email, marketingOptIn } = body;

  const validPlans = ["one_time", "pro", "annual"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const isSubscription = plan === "pro" || plan === "annual";

  // 3. Auth — required for Pro/Annual, optional for one-time guest checkout
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (isSubscription && !user) {
    return NextResponse.json(
      { error: "Please create an account before subscribing to Pro." },
      { status: 401 }
    );
  }

  // 4. Detect currency
  const countryCode = request.headers.get("x-vercel-ip-country");
  const currency = detectCurrency(countryCode);

  // 5. Resolve Stripe Price ID
  let priceId: string;
  try {
    priceId = getPriceId(plan, currency);
  } catch (err) {
    console.error("Price ID lookup failed:", err);
    return NextResponse.json({ error: "Pricing configuration error." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // 6. Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(email || user?.email ? { customer_email: email || user?.email } : {}),
    success_url: `${appUrl}/results/new?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/`,
    allow_promotion_codes: true,
    payment_method_types: ["card"],
    metadata: {
      plan,
      marketing_opt_in: marketingOptIn ? "true" : "false",
      ...(user ? { user_id: user.id } : {}),
    },
    ...(isSubscription && user
      ? {
          subscription_data: {
            metadata: { user_id: user.id, plan },
          },
        }
      : {}),
  });

  return NextResponse.json({ url: session.url });
}
