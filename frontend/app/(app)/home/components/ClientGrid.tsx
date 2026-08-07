"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/clients";
import type { InboxMessage, WhatsAppConnection } from "@/lib/whatsapp";
import { useNewSpace } from "@/app/(app)/components/NewSpaceProvider";

import { ClientCard, WhatsAppConnectionCard, WhatsAppInbox } from "./";

type ClientGridProps = {
  userName?: string;
  clients: Client[];
  whatsappConnections?: WhatsAppConnection[];
  whatsappInbox?: InboxMessage[];
  webhookUrl?: string;
};

export function ClientGrid({
  userName,
  clients,
  whatsappConnections = [],
  whatsappInbox = [],
  webhookUrl = "",
}: ClientGridProps) {
  const [query, setQuery] = useState("");
  const { openNewSpace } = useNewSpace();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) => client.name.toLowerCase().includes(q));
  }, [clients, query]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="animate-rise-in">
        <p className="text-sm font-medium text-primary">Espacio de trabajo</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Hola{userName ? `, ${userName}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Elegí un cliente para abrir su chat o creá un espacio nuevo para
          empezar a trabajar.
        </p>
      </div>

      <div className="animate-fade-in mt-6 space-y-4" style={{ animationDelay: "60ms" }}>
        <WhatsAppConnectionCard connections={whatsappConnections} webhookUrl={webhookUrl} />
        <WhatsAppInbox messages={whatsappInbox} />
      </div>

      {clients.length > 0 ? (
        <>
          <div className="animate-fade-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar cliente…"
                aria-label="Buscar cliente"
                className="h-9 pl-8"
              />
            </div>
            <Button onClick={openNewSpace} className="sm:ml-auto">
              <Plus />
              Nuevo espacio
            </Button>
          </div>

          {filtered.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((client, index) => (
                <ClientCard key={client.id} client={client} index={index} />
              ))}
            </div>
          ) : (
            <div className="animate-fade-in mt-6 rounded-2xl border border-border/60 bg-card/80 p-10 text-center backdrop-blur-sm">
              <p className="font-medium text-foreground">
                No hay clientes que coincidan con “{query}”
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Probá con otro término o creá un espacio nuevo.
              </p>
            </div>
          )}
        </>
      ) : (
        <div
          className={cn(
            "animate-rise-in mt-10 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center backdrop-blur-sm",
          )}
          style={{ animationDelay: "120ms" }}
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Plus className="size-6" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground">
            Creá tu primer espacio
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Un espacio es el chat de un cliente, con su contexto fiscal
            guardado para que la IA responda según su caso.
          </p>
          <Button onClick={openNewSpace} className="mt-6">
            <Plus />
            Crear espacio
          </Button>
        </div>
      )}
    </div>
  );
}
