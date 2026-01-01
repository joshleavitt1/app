export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          CARI
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Which accounts feel strategic… but actually aren’t?
        </h1>
        <p className="text-lg text-slate-800">
          CARI is a private reality check for institutional salespeople.
          <br />
          It shows you which relationships are real — and which ones quietly
          never pay you back.
        </p>
        <div className="space-y-3 text-slate-700">
          <p>No CRM. No coaching. No visibility.</p>
          <p>Just clarity, for yourself.</p>
        </div>
        <div className="space-y-2">
          <a
            href="/app/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 sm:w-auto"
          >
            Log in with email →
          </a>
          <p className="text-sm text-slate-500">Magic link. No password.</p>
        </div>
      </section>

      <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">Who This Is For</h2>
          <p className="text-slate-700">
            Institutional sales • Coverage • Relationship managers
            <br />
            Fixed income, rates, credit, structured, prime
          </p>
          <p className="text-slate-700">
            If you don’t say coverage, this isn’t for you.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900">What It Does</h2>
          <p className="text-slate-700">
            You score accounts across access, economics, trust, and influence.
            CARI reflects the reality back — privately.
          </p>
          <p className="text-slate-700">You decide what to do next.</p>
        </div>
      </section>

      <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-slate-900">Privacy</h3>
          <p className="text-slate-700">
            Personal. Standalone. Not shared. Not reported.
            <br />
            Designed for judgment — not management.
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-slate-900">Pricing</h3>
          <p className="text-slate-700">
            $149 / year
            <br />
            Personal license
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-slate-900">Why Now</h3>
          <p className="text-slate-700">
            You already know which accounts might not be real.
            <br />
            CARI just makes it undeniable.
          </p>
        </div>
      </section>

      <div className="flex flex-col items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Ready
          </p>
          <p className="text-base text-slate-800">
            No friction. Get your magic link and see your accounts clearly.
          </p>
        </div>
        <a
          href="/app/login"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Log in with email →
        </a>
      </div>
    </div>
  );
}
