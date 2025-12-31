import Link from "next/link";
import { ReactNode } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function AppShell({ children }: { children: ReactNode }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="bg-[#0b1021] text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10">
          <header className="sticky top-0 z-20 -mx-4 mb-6 border-b border-white/5 bg-[#0b1021]/80 px-4 py-4 backdrop-blur">
            <nav className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-lg">
                  A
                </div>
                <div className="leading-tight">
                  <div>App</div>
                  <p className="text-xs text-slate-400">Narrative builder</p>
                </div>
              </Link>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link className="rounded-md px-2 py-1 hover:bg-white/5" href="/narratives">
                  Narratives
                </Link>
                <Link className="rounded-md px-2 py-1 hover:bg-white/5" href="/billing">
                  Billing
                </Link>
              </div>
              <div className="ml-auto flex items-center gap-2 text-sm text-slate-400">
                {user ? (
                  <>
                    <span className="hidden sm:inline">Signed in</span>
                    <form action={signOut}>
                      <Button type="submit" variant="ghost">
                        Sign out
                      </Button>
                    </form>
                  </>
                ) : (
                  <Link className="rounded-md px-2 py-1 hover:bg-white/5" href="/sign-in">
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 border-t border-white/5 pt-6 text-sm text-slate-500">
            Built for rapid customer narratives. Connected to Supabase + Stripe.
          </footer>
        </div>
      </body>
    </html>
  );
}
