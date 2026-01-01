import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Monsters MVP",
  description: "Single-player math battles for grades 2-3"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-emerald-50">
          <header className="border-b border-indigo-100/80 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
                  Math Monsters
                </p>
                <p className="text-sm text-slate-600">Answer to attack. Built for fun, not funnels.</p>
              </div>
              <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                MVP: Single-player battle loop
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
