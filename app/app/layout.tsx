import { ensureProfile } from "@/lib/profiles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedAppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/app/login");
  }

  await ensureProfile(supabase, session.user);

  return <>{children}</>;
}
