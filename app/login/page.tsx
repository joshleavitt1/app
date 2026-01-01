import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="text-slate-700">
        Placeholder login screen for authentication. Implement your auth flows
        here.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back Home
        </Link>
        <Link
          href="/app"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Proceed to App
        </Link>
      </div>
    </section>
  );
}
