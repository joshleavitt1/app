import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionWithProfile, hasActiveSubscription } from "@/lib/subscription";
import { ExampleOutput } from "@/components/marketing/example-output";

export default async function HomePage() {
  const { user, profile } = await getSessionWithProfile();
  const isActive = hasActiveSubscription(profile?.subscription_status);

  const startHref = user ? (isActive ? "/narratives/new" : "/billing") : "/sign-in";
  const listHref = user ? (isActive ? "/narratives" : "/billing") : "/sign-in";

  return (
    <div className="space-y-14">
      <section className="grid gap-8 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-sky-500/5 p-8 shadow-2xl shadow-indigo-500/20 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            Hero
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">Walk into every client call with a clear story.</h1>
            <p className="text-lg text-slate-200">
              Narrative Ready turns messy notes, metrics, and context into a confident talk track and client-ready one-pager in minutes.
            </p>
            <p className="text-sm text-slate-400">Built for client-facing teams in complex industries (finance, consulting, enterprise).</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={startHref}>Start a narrative</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#example">See an example output</Link>
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#0f162f] p-4">
              <p className="text-sm font-semibold text-white">Before</p>
              <p className="text-sm text-slate-300">Scrambling in old decks, CRM notes, and spreadsheets</p>
            </div>
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
              <p className="text-sm font-semibold text-white">With Narrative Ready</p>
              <p className="text-sm text-slate-200">A tight narrative you can actually use live</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0f162f] p-4">
              <p className="text-sm font-semibold text-white">Result</p>
              <p className="text-sm text-slate-300">More confidence, cleaner meetings, stronger closes</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f162f] p-5">
          <p className="text-sm font-semibold text-indigo-200">What it does</p>
          <p className="mt-1 text-lg font-semibold text-white">A prep tool, not another platform.</p>
          <p className="mt-2 text-sm text-slate-300">Narrative Ready helps you structure the conversation:</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>• Headline — what they should believe after the call</li>
            <li>• Confidence signals — the proof points</li>
            <li>• Watchouts — the risks, framed without alarm</li>
            <li>• Actions — what you’re doing and why it matters</li>
            <li>• Close — a clean question that moves things forward</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-white/5 bg-white/5 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-200">How it works</p>
            <h2 className="text-2xl font-bold text-white">Three steps to a client-ready talk track</h2>
          </div>
          <Button asChild>
            <Link href={startHref}>Create your first narrative</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "1) Add the essentials",
              body: "Client, objective, what changed, key proof points."
            },
            {
              title: "2) Get a clean talk track",
              body: "A structured narrative you can follow in real time."
            },
            {
              title: "3) Export and reuse",
              body: "Copy to clipboard, print to PDF, reuse next quarter."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/10 bg-[#0f162f] p-4">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-sm text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="example" className="grid gap-6 rounded-2xl border border-white/5 bg-[#0f162f] p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-indigo-200">Example output</p>
          <h2 className="text-2xl font-bold text-white">Client Readiness Update</h2>
          <div className="space-y-3 text-sm text-slate-200">
            <div>
              <p className="font-semibold text-white">Despite recent volatility, you remain positioned to meet near-term income goals.</p>
            </div>
            <div>
              <p className="text-indigo-200">What’s changed</p>
              <p>Rates moved sharply this month, raising questions about income stability…</p>
            </div>
            <div>
              <p className="text-indigo-200">What’s working</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>Income targets met QTD</li>
                <li>Downside reduced vs benchmark…</li>
              </ul>
            </div>
            <div>
              <p className="text-indigo-200">What we’re watching</p>
              <p>Duration sensitivity if rates spike again…</p>
            </div>
            <div>
              <p className="text-indigo-200">What we’re doing</p>
              <p>Run an income stress test and share a one-page summary…</p>
            </div>
            <div>
              <p className="text-indigo-200">Close</p>
              <p>Does this positioning still align with your priorities over the next 6–12 months?</p>
            </div>
          </div>
          <ExampleOutput />
        </div>
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-wide text-indigo-200">Why this is different</p>
          <h3 className="text-xl font-semibold text-white">Designed for the moment that matters: right before the call.</h3>
          <p className="text-sm text-slate-300">
            Most sales tools store content. Most AI tools generate text. Narrative Ready gives you structure—so you can speak clearly, fast.
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            <li>• Opinionated templates (no blank page)</li>
            <li>• Calm UI + live preview</li>
            <li>• Executive tone by default</li>
            <li>• No CRM required</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl border border-white/5 bg-white/5 p-8 md:grid-cols-[1fr_1.1fr]">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-indigo-200">Pricing</p>
          <h2 className="text-2xl font-bold text-white">Early Access</h2>
          <p className="text-4xl font-semibold text-white">$19/mo <span className="text-base text-slate-300">(founders price)</span></p>
          <p className="text-sm text-slate-400">Includes:</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-200">
            <li>• Unlimited narratives</li>
            <li>• Presenter mode</li>
            <li>• Copy + print to PDF</li>
            <li>• New templates as they launch</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href={listHref}>Get Early Access</Link>
            </Button>
          </div>
          <p className="text-sm text-slate-400">Cancel anytime.</p>
        </div>
        <div className="space-y-4 rounded-xl border border-white/10 bg-[#0f162f] p-5">
          <p className="text-sm uppercase tracking-wide text-indigo-200">FAQ</p>
          <div className="space-y-3 text-sm text-slate-200">
            <div>
              <p className="font-semibold text-white">Is this “AI”?</p>
              <p>Not by default. It’s a structured narrative builder. (AI assist can be optional later.)</p>
            </div>
            <div>
              <p className="font-semibold text-white">Do I need Salesforce / HubSpot?</p>
              <p>No. Start with what you already have—notes, metrics, context.</p>
            </div>
            <div>
              <p className="font-semibold text-white">What do I export?</p>
              <p>A talk track you can copy/paste and a print-friendly one-pager (PDF via browser).</p>
            </div>
            <div>
              <p className="font-semibold text-white">Who is this for?</p>
              <p>Client-facing professionals who need to sound prepared in complex conversations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-sky-500/10 p-8 text-center">
        <p className="text-sm uppercase tracking-wide text-indigo-200">Footer CTA</p>
        <h2 className="text-3xl font-bold text-white">Be ready in 10 minutes.</h2>
        <p className="text-lg text-slate-200">Start your first narrative and walk into the next call with a clear story.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={startHref}>Start</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#example">See example</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
