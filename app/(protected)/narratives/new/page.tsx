import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { defaultNarrative } from "@/lib/narrative";

export default async function NewNarrativePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data, error } = await supabase
    .from("narratives")
    .insert({
      user_id: user!.id,
      title: "Client Readiness Update",
      content: defaultNarrative
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    redirect("/narratives");
  }

  redirect(`/narratives/${data.id}`);
}
