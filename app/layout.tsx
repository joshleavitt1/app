import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/app", label: "App Dashboard" },
  { href: "/app/accounts/new", label: "New Account" },
  { href: "/app/accounts/123", label: "Account (123)" },
  { href: "/app/accounts/123/score", label: "Score (123)" },
  { href: "/app/accounts/123/result", label: "Result (123)" }
];

export const metadata: Metadata = {
  title: "App Router Scaffold",
  description: "Next.js 14 App Router scaffold with Tailwind CSS"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Navigation
              </p>
              <p className="text-lg font-bold text-slate-900">
                Next.js App Router Scaffold
              </p>
            </div>
            <nav className="flex flex-wrap gap-3 text-sm font-medium text-blue-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 transition hover:border-blue-200 hover:bg-blue-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
