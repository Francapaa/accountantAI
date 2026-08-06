import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth";
import { getClients } from "@/lib/clients";

import { AppShell } from "./components";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const clients = await getClients();

  const userEmail =
    typeof user.email === "string" && user.email ? user.email : undefined;

  return (
    <AppShell userEmail={userEmail} clients={clients}>
      {children}
    </AppShell>
  );
}
