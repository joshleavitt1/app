import Link from "next/link";

export default function NewAccountPage() {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
      <p className="text-slate-700">
        Placeholder screen for capturing new account information.
      </p>
      <div className="flex gap-3">
        <Link
          href="/app"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/app/accounts/123"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          View Example Account
        </Link>
      </div>
    </section>
  );
}
