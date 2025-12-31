"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function MagicLinkForm() {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback` }
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage("Check your email for a magic link to sign in.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-200">
        Work email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          placeholder="you@company.com"
        />
      </label>
      <Button type="submit" disabled={status === "sending"} className="w-full justify-center">
        {status === "sending" ? "Sending..." : "Send magic link"}
      </Button>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-rose-300" : "text-indigo-200"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
