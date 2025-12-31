import Link from "next/link";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-white/5 bg-white/5 p-6 shadow-2xl shadow-indigo-500/10">
      <p className="text-sm uppercase tracking-wide text-indigo-200">Auth</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Sign in with magic link</h1>
      <p className="mt-2 text-slate-300">
        We use passwordless auth via Supabase. A profile row will be created on first login to pair your user with
        Stripe.
      </p>
      <div className="mt-6">
        <MagicLinkForm />
      </div>
      <p className="mt-6 text-sm text-slate-400">
        Already activated billing? Head to <Link href="/narratives" className="text-indigo-300 underline">Narratives</Link>.
      </p>
    </div>
  );
}
