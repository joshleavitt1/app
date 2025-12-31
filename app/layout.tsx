import "./globals.css";
import { Metadata } from "next";
import AppShell from "@/components/shell/app-shell";

export const metadata: Metadata = {
  title: "App — Client Readiness Narratives",
  description: "Magic-link auth, Stripe-gated narrative builder, and Supabase-backed autosave."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
