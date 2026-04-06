import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/stripe";
import type Stripe from "stripe";
import type { Plan } from "@/types";

// POST /api/webhooks/stripe
// The ONLY place where entitlements are written to the database.
// Verifies the Stripe webhook signature before processing any event.
// Uses the service role client (bypasses RLS) — this is intentional.

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  // 1. Verify webhook signature — reject anything that can't be verified
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 2. Handle events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, admin);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, admin);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, admin);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, admin);
        break;
      }

      default:
        // Unhandled event — acknowledge receipt but do nothing
        break;
    }
  } catch (err) {
    console.error(`Error handling webhook event ${event.type}:`, err);
    // Return 500 so Stripe retries
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Event handlers ────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  admin: ReturnType<typeof createAdminClient>
) {
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan as Plan;
  const marketingOptIn = session.metadata?.marketing_opt_in === "true";

  if (!userId || !plan) {
    console.error("checkout.session.completed: missing metadata", session.metadata);
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string | null;
  const currency = (session.currency ?? "usd") as "usd" | "gbp" | "eur";

  const periodStart = new Date();
  const periodEnd = plan === "one_time"
    ? null
    : plan === "pro"
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days

  const { error } = await admin.from("subscriptions").insert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan,
    status: "active",
    currency,
    current_period_start: periodStart.toISOString(),
    current_period_end: periodEnd?.toISOString() ?? null,
    optimizations_used_this_period: 0,
    optimizations_limit: PLAN_LIMITS[plan],
    marketing_opt_in: marketingOptIn,
  });

  if (error) {
    console.error("Failed to write subscription to DB:", error);
    throw error;
  }

  console.log(`Entitlement created: user=${userId} plan=${plan} customer=${customerId}`);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  admin: ReturnType<typeof createAdminClient>
) {
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: subscription.status as "active" | "past_due" | "canceled" | "trialing",
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      // Reset usage counter on renewal
      optimizations_used_this_period: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to update subscription:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  admin: ReturnType<typeof createAdminClient>
) {
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to cancel subscription:", error);
    throw error;
  }
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  admin: ReturnType<typeof createAdminClient>
) {
  if (!invoice.subscription) return;

  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription as string);

  if (error) {
    console.error("Failed to mark subscription past_due:", error);
    throw error;
  }
}
