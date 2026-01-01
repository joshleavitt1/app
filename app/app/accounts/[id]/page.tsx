import Link from "next/link";

type AccountPageProps = {
  params: { id: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "123" }];
}

export default function AccountPage({ params }: AccountPageProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        Account Details: {params.id}
      </h1>
      <p className="text-slate-700">
        Placeholder account details page. Replace with account summary content
        fetched via your data layer.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/accounts/123/score"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Score Account
        </Link>
        <Link
          href="/app"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
