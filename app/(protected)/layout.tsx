import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionWithProfile, hasActiveSubscription } from "@/lib/subscription";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getSessionWithProfile();
  if (!user) redirect("/sign-in");
  if (!hasActiveSubscription(profile?.subscription_status)) {
    redirect("/billing");
  }

  return <>{children}</>;
}
