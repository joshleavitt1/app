import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionWithProfile, hasActiveSubscription } from "@/lib/subscription";

export default async function BillingPage() {
  const { user, profile } = await getSessionWithProfile();
  const active = hasActiveSubscription(profile?.subscription_status);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-slate-300">Sign in to manage your subscription.</p>
        <div className="mt-4 flex gap-3">
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-indigo-200">Billing</p>
          <h1 className="text-3xl font-bold text-white">Subscription</h1>
          <p className="text-slate-300">
            Status: <span className={active ? "text-emerald-300" : "text-amber-300"}>{active ? "Active" : "Needs activation"}</span>
          </p>
          <p className="text-sm text-slate-400">Stripe customer id: {profile?.stripe_customer_id ?? "pending"}</p>
        </div>
        <div className="flex gap-2">
          <form action="/api/stripe/checkout" method="POST">
            <Button type="submit">{active ? "Switch plan" : "Start subscription"}</Button>
          </form>
          <form action="/api/stripe/portal" method="POST">
            <Button type="submit" variant="ghost">
              Open portal
            </Button>
          </form>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#0f162f] p-4">
          <h3 className="text-lg font-semibold text-white">What you get</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
            <li>Autosave + RLS-protected narratives</li>
            <li>Presenter mode and export-friendly view</li>
            <li>Priority access to Stripe-gated features</li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0f162f] p-4">
          <h3 className="text-lg font-semibold text-white">How it works</h3>
          <p className="text-slate-300">
            Stripe webhooks update <code>subscription_status</code> in Supabase. The paywall checks this column before
            allowing access to narratives.
          </p>
        </div>
      </div>
    </div>
  );
}
