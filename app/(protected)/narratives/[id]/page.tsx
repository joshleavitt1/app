import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NarrativeBuilder } from "@/components/narratives/narrative-builder";
import type { NarrativeRecord } from "@/lib/narrative";

export default async function NarrativeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("narratives").select("*").eq("id", params.id).single();

  if (!data) {
    notFound();
  }

  return <NarrativeBuilder narrative={data as unknown as NarrativeRecord} />;
}
