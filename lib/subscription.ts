import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSessionWithProfile() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) {
    const { data } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email })
      .select("*")
      .single();
    profile = data ?? null;
  }
  return { user, profile };
}

export function hasActiveSubscription(status: string | null | undefined) {
  return status === "active";
}
