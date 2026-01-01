"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MagicLinkState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const baseState: MagicLinkState = { status: "idle" };

export async function requestMagicLink(
  _prevState: MagicLinkState = baseState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    return { status: "error", message: "Please enter your email." };
  }

  const supabase = createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const redirectTo = `${siteUrl}${basePath}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message: "Magic link sent. Check your email to finish signing in."
  };
}
