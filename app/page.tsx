import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Home</h1>
      <p className="text-slate-700">
        This is the root landing page. Use the navigation to explore the App
        Router routes.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Go to Login
        </Link>
        <Link
          href="/app"
          className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-100"
        >
          View App Dashboard
        </Link>
      </div>
    </section>
  );
}
