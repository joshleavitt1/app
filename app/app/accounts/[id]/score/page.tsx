import Link from "next/link";

type AccountScorePageProps = {
  params: { id: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "123" }];
}

export default function AccountScorePage({ params }: AccountScorePageProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        Score Account: {params.id}
      </h1>
      <p className="text-slate-700">
        Placeholder scoring page. Insert question inputs and quick scoring UI
        here.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/app/accounts/${params.id}/result`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          View Result
        </Link>
        <Link
          href={`/app/accounts/${params.id}`}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to Account
        </Link>
      </div>
    </section>
  );
}
