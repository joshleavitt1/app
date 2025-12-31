import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20"
});

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = session.subscription as string;
    await syncSubscription(supabase, subscriptionId, session.customer as string);
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await syncSubscription(supabase, subscription.id, subscription.customer as string, subscription.status, subscription.current_period_end);
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  subscriptionId: string,
  customerId: string,
  status?: string,
  periodEnd?: number
) {
  const subscription = status
    ? { id: subscriptionId, status, current_period_end: periodEnd }
    : await stripe.subscriptions.retrieve(subscriptionId);

  const subStatus = subscription.status === "active" || subscription.status === "trialing" ? "active" : "canceled";
  const billingCycle = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const metadataUserId = (subscription as any).metadata?.supabase_user_id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  const profileId = profile?.id ?? metadataUserId;

  if (!profileId) {
    console.warn("No profile found for subscription", subscriptionId);
    return;
  }

  await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      subscription_status: subStatus,
      billing_cycle_anchor: billingCycle
    })
    .eq("id", profileId);
}
