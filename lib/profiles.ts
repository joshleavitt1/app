import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User | null
) {
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        plan: "free"
      },
      { onConflict: "id" }
    )
    .select("id, email, plan")
    .single();

  if (error) {
    console.error("Failed to upsert profile", error);
    return null;
  }

  return data;
}
