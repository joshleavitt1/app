import Link from "next/link";
import { MagicLinkForm } from "./MagicLinkForm";

export default function LoginPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          CARI
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Log in with magic link
        </h1>
        <p className="text-slate-700">
          Enter your work email. We’ll send you a one-time link. No passwords.
        </p>
        <MagicLinkForm />
        <p className="text-xs text-slate-500">
          By continuing you agree to receive a sign-in email for this device.
        </p>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Need access?</h2>
        <p className="mt-2 text-sm text-slate-700">
          Not sure if you have an account yet? Use your work email to get
          started. If you don&apos;t see the email, check spam or contact your
          admin.
        </p>
        <div className="mt-4 flex gap-3 text-sm">
          <Link
            href="/"
            className="rounded-md border border-slate-200 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to landing
          </Link>
          <Link
            href="/app"
            className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-100"
          >
            Dashboard
          </Link>
        </div>
      </aside>
    </div>
  );
}
