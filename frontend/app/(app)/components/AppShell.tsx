"use client";

import { useState } from "react";
import { LogOut, Menu } from "lucide-react";

import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/clients";
import { Logo } from "@/lib/components/logo";
import { signOut } from "@/lib/actions";

import { NewSpaceProvider } from "./NewSpaceProvider";
import { SidebarDrawer } from "./SidebarDrawer";

type AppShellProps = {
  userEmail?: string;
  clients: Client[];
  children: React.ReactNode;
};

export function AppShell({ userEmail, clients, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <NewSpaceProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú de espacios"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none",
                "hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <Menu className="size-5" />
            </button>
            <Logo className="flex-1" />

            <div className="flex items-center gap-2">
              {userEmail && (
                <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">
                  {userEmail}
                </span>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <LogOut />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </header>

        <SidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          clients={clients}
        />

        <main className="flex w-full flex-1 flex-col">{children}</main>
      </div>
    </NewSpaceProvider>
  );
}
