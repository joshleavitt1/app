import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { NarrativeRecord } from "@/lib/narrative";

export default async function NarrativesPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("narratives").select("*").order("updated_at", { ascending: false });
  const narratives = (data as unknown as NarrativeRecord[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-indigo-200">Narratives</p>
          <h1 className="text-3xl font-bold text-white">Recent narratives</h1>
          <p className="text-slate-300">List, edit, and present your latest Client Readiness updates.</p>
        </div>
        <Button asChild>
          <Link href="/narratives/new">New narrative</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {narratives.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-white/10 p-6 text-slate-400">
            No narratives yet. Start with the template to draft your first talk track.
          </div>
        )}
        {narratives.map((narrative) => (
          <div key={narrative.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-indigo-200">Client Readiness Update</p>
                <p className="text-lg font-semibold text-white">{narrative.content.client.name || "Untitled client"}</p>
              </div>
              <div className="flex gap-2">
                <Link className="text-sm text-indigo-200 underline" href={`/narratives/${narrative.id}`}>
                  Edit
                </Link>
                <Link className="text-sm text-slate-300 underline" href={`/narratives/${narrative.id}/presenter`}>
                  Presenter
                </Link>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-300">{narrative.content.narrative.headline || "Add a headline"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
