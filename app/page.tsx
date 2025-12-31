import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionWithProfile, hasActiveSubscription } from "@/lib/subscription";

export default async function HomePage() {
  const { user, profile } = await getSessionWithProfile();
  const isActive = hasActiveSubscription(profile?.subscription_status);

  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-2xl shadow-indigo-500/10">
        <p className="text-sm uppercase tracking-wide text-indigo-200">Client Readiness</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">
          Build and present narrative-driven account updates.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          App ships with magic-link auth, Stripe subscription gating, and a structured talk track for reliable customer
          storytelling. Autosaves to Supabase, exports cleanly, and keeps risk in view.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <Button asChild>
                <Link href={isActive ? "/narratives" : "/billing"}>{isActive ? "Open narratives" : "Activate billing"}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/narratives/new">New narrative</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/sign-in">Get started with magic link</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/billing">Billing overview</Link>
              </Button>
            </>
          )}
        </div>
        <ul className="mt-8 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          <li className="rounded-xl border border-white/5 bg-white/5 p-3">
            Autosave + RLS: narrative JSON writes in place; only owners can read/write.
          </li>
          <li className="rounded-xl border border-white/5 bg-white/5 p-3">
            Presenter mode + print-to-PDF export for clean client delivery.
          </li>
          <li className="rounded-xl border border-white/5 bg-white/5 p-3">
            Stripe webhooks keep subscription_status current for paywall checks.
          </li>
          <li className="rounded-xl border border-white/5 bg-white/5 p-3">
            Structured template: confidence signals, watchouts, and next steps.
          </li>
        </ul>
      </section>
      <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-slate-800 to-sky-500/10 p-6">
        <h2 className="text-xl font-semibold text-white">Preview</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          <div className="rounded-lg border border-white/10 bg-[#0f162f] p-4">
            <p className="text-indigo-200">Paywall aware</p>
            <p className="mt-1 text-slate-300">Only active subscribers see builders; others land on billing.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0f162f] p-4">
            <p className="text-indigo-200">Builder</p>
            <p className="mt-1 text-slate-300">Repeatable sections for signals, watchouts, and actions with autosave.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0f162f] p-4">
            <p className="text-indigo-200">Talk track</p>
            <p className="mt-1 text-slate-300">Sticky preview and copy-to-clipboard for presenter-ready readouts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
