"use client";

import Link from "next/link";
import { MessageSquare, Plus, X } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/clients";

import { useNewSpace } from "./NewSpaceProvider";

type SidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  clients: Client[];
};

export function SidebarDrawer({ open, onClose, clients }: SidebarDrawerProps) {
  const { openNewSpace } = useNewSpace();

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-border bg-card shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
          <p className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Espacios
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-3 pt-3">
          <Button onClick={openNewSpace} className="w-full">
            <Plus />
            Nuevo espacio
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Espacios de clientes">
          {clients.length === 0 ? (
            <p className="px-3 text-sm text-muted-foreground">
              Todavía no tenés espacios. Creá tu primer cliente.
            </p>
          ) : (
            <ul className="space-y-1">
              {clients.map((client) => (
                <li key={client.id}>
                  <Link
                    href={`/clients/${client.id}`}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none",
                      "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                      <MessageSquare className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {client.name}
                      </span>
                      {client.tax_regime && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {client.tax_regime}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}
