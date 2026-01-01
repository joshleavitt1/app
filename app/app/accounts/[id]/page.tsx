import Link from "next/link";

interface AccountPageProps {
  params: {
    id: string;
  };
}

export default function AccountDetailPage({ params }: AccountPageProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        Account Overview: {params.id}
      </h1>
      <p className="text-slate-700">
        Placeholder detail view for account <strong>{params.id}</strong>.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/app/accounts/${params.id}/score`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          View Score
        </Link>
        <Link
          href={`/app/accounts/${params.id}/result`}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          View Result
        </Link>
        <Link
          href="/app/accounts/new"
          className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-100"
        >
          Create Another
        </Link>
      </div>
    </section>
  );
}
