import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatTalkTrack } from "@/lib/talk-track";
import type { NarrativeRecord } from "@/lib/narrative";
import { PresenterActions } from "@/components/narratives/presenter-actions";

export default async function PresenterPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("narratives").select("*").eq("id", params.id).single();

  if (!data) {
    notFound();
  }

  const narrative = data as unknown as NarrativeRecord;
  const talkTrack = formatTalkTrack(narrative.content);

  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 print:border-none print:bg-white print:text-black">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-indigo-200 print:text-slate-600">Presenter view</p>
          <h1 className="text-3xl font-bold text-white print:text-black">
            Client Readiness — {narrative.content.client.name || "Untitled"}
          </h1>
          <p className="text-slate-300 print:text-slate-700">
            {narrative.content.meeting.date} · {narrative.content.meeting.type} · {narrative.content.meeting.objective}
          </p>
        </div>
        <PresenterActions talkTrack={talkTrack} />
      </div>

      <article className="space-y-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0f162f]/50 p-4 text-slate-100 shadow print:border-none print:bg-white print:text-black">
        {talkTrack}
      </article>
    </div>
  );
}
