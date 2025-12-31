import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20"
});

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const customerId = profile?.stripe_customer_id;

  if (!customerId) {
    return NextResponse.redirect(new URL("/billing", request.url));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/billing`
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
