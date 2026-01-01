import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AppDashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/app/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", session.user.id)
    .maybeSingle();

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome{session.user.email ? `, ${session.user.email}` : ""}
          </h1>
          <p className="text-sm text-slate-600">
            Plan: {profile?.plan ?? "free"} • Account snapshots coming soon.
          </p>
        </div>
        <Link
          href="/app/accounts/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Create New Account
        </Link>
      </div>
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-slate-600">
        <p className="font-medium text-slate-800">Next steps</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li>Wire account listing here.</li>
          <li>Link to scoring flow once data is connected.</li>
          <li>Show latest results snapshot when available.</li>
        </ul>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/accounts/123"
          className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-100"
        >
          View Sample Account
        </Link>
      </div>
    </section>
  );
}
