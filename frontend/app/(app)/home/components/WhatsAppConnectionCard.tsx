"use client";

import { useState } from "react";
import { MessageSquarePlus, Plus, ShieldCheck } from "lucide-react";

import { Badge } from "@/lib/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WhatsAppConnection } from "@/lib/whatsapp";
import { unlinkWhatsAppConnection } from "../../whatsapp/actions";

import { WhatsAppLinkModal } from "./WhatsAppLinkModal";

type WhatsAppConnectionCardProps = {
  connections: WhatsAppConnection[];
  webhookUrl: string;
};

const STATUS_LABEL: Record<WhatsAppConnection["status"], string> = {
  pending: "Pendiente",
  connected: "Conectado",
  error: "Error",
};

export function WhatsAppConnectionCard({ connections, webhookUrl }: WhatsAppConnectionCardProps) {
  const [open, setOpen] = useState(false);
  const connected = connections[0];

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
            Conexión WhatsApp
          </h2>
          <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
            {connected
              ? "Tu número está enlazado. La API captura los mensajes entrantes."
              : "Enlazá tu número de negocio para capturar los mensajes de tus clientes."}
          </p>
        </div>

        {!connected && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors outline-none hover:bg-primary/20 focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Enlazar número de WhatsApp"
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>

      {connected ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <MessageSquarePlus className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{connected.phone ?? "Número"}</p>
            </div>
            <Badge variant={connected.status === "error" ? "destructive" : "secondary"}>
              {STATUS_LABEL[connected.status]}
            </Badge>
          </div>

          <form action={unlinkWhatsAppConnection}>
            <input type="hidden" name="connection_id" value={connected.id} />
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Desenlazar
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Abrí el modal para guardar tu número. Configurá el webhook en Meta una sola vez
              apuntando a{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{webhookUrl}</code>.
            </span>
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Enlazar número
          </button>
        </div>
      )}

      <WhatsAppLinkModal open={open} onOpenChange={setOpen} onSuccess={() => setOpen(false)} />
    </section>
  );
}