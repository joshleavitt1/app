import Link from "next/link";

type AccountResultPageProps = {
  params: { id: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "123" }];
}

export default function AccountResultPage({ params }: AccountResultPageProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        Account Result: {params.id}
      </h1>
      <p className="text-slate-700">
        Placeholder results page. Show computed scores, bucket labels, and
        export controls here.
      </p>
      <div className="flex flex-wrap gap-3">
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
