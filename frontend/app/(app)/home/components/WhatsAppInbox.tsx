"use client";

import { useActionState } from "react";
import { LoaderCircle, MessageSquare, PencilLine, Send } from "lucide-react";

import { Button } from "@/lib/components/ui/button";
import { Label } from "@/lib/components/ui/field";
import { cn } from "@/lib/utils";
import type { InboxMessage } from "@/lib/whatsapp";
import { approveDraft, saveDraft, type ActionState } from "../../whatsapp/actions";

type WhatsAppInboxProps = {
  messages: InboxMessage[];
};

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "animate-shake rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive",
      )}
    >
      {message}
    </div>
  );
}

/** Row without a saved draft yet: compose it (nothing is sent). */
function ComposeRow({ message }: { message: InboxMessage }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(saveDraft, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="conversation_id" value={message.conversation_id} />
      <input type="hidden" name="reply_to_message_id" value={message.id} />

      <Label htmlFor={`reply-${message.id}`}>Tu respuesta (borrador)</Label>
      <textarea
        id={`reply-${message.id}`}
        name="text"
        rows={3}
        placeholder="Escribí la respuesta. Se guarda como borrador: nada se envía aún."
        className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      {state.error && <ErrorAlert message={state.error} />}

      <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <PencilLine />}
        Guardar borrador
      </Button>
    </form>
  );
}

/** Row with a saved draft awaiting explicit acceptance to be sent. */
function ApproveRow({ message }: { message: InboxMessage }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(approveDraft, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="draft_id" value={message.draft_id ?? ""} />

      <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Borrador — no enviado
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{message.draft_content}</p>
      </div>

      {state.error && <ErrorAlert message={state.error} />}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <Send />}
        Aceptar y enviar
      </Button>
    </form>
  );
}

export function WhatsAppInbox({ messages }: WhatsAppInboxProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm">
      <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
        Mensajes para aprobar
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Respondé con un borrador y luego aceptá el envío: nada sale a WhatsApp sin tu aprobación.
      </p>

      <ul className="mt-4 space-y-4">
        {messages.map((message) => (
          <li key={message.id} className="rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {message.client_name ?? "Cliente"}
                </p>
                {message.created_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleString("es-AR")}
                  </p>
                )}
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{message.content}</p>
            <div className="mt-3">
              {message.draft_id ? (
                <ApproveRow message={message} />
              ) : (
                <ComposeRow message={message} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}