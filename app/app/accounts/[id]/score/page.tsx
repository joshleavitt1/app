import Link from "next/link";

interface ScorePageProps {
  params: {
    id: string;
  };
}

export default function AccountScorePage({ params }: ScorePageProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        Account Score: {params.id}
      </h1>
      <p className="text-slate-700">
        Placeholder view for displaying a score for account{" "}
        <strong>{params.id}</strong>.
      </p>
      <div className="flex gap-3">
        <Link
          href={`/app/accounts/${params.id}`}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to Account
        </Link>
        <Link
          href={`/app/accounts/${params.id}/result`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          View Result
        </Link>
      </div>
    </section>
  );
}
