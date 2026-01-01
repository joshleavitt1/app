import Link from "next/link";

export default function AppDashboardPage() {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">App Dashboard</h1>
      <p className="text-slate-700">
        Welcome to the application hub. Navigate to account-related routes
        below.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/accounts/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Create Account
        </Link>
        <Link
          href="/app/accounts/123"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          View Account 123
        </Link>
      </div>
    </section>
  );
}
