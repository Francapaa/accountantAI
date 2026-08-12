"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_ITEMS: ReactNode[] = [
  <ChatBubble
    key="q"
    reader="Cliente"
    text="Hola! ¿Ya puedo facturar si estoy en la categoría B del monotributo?"
  />,
  <ChatBubble
    key="a"
    reader="AccountantAI"
    accent
    text="Sí. La categoría B no requiere la CUIT de inicio del monotributista para facturar. La condición es estar inscripto y al día con la recategorización."
    cite="Res. Gral. ARCA 5/2025, art. 3"
  />,
  <ChatBubble
    key="q2"
    reader="Contador"
    text="Perfecto, te lo reenvío verificado. Gracias."
  />,
];

type ChatBubbleProps = {
  reader: string;
  text: string;
  cite?: string;
  accent?: boolean;
};

function ChatBubble({ reader, text, cite, accent }: ChatBubbleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
        {reader}
      </span>
      <div
        className={cn(
          "rounded-2xl px-3 py-2 text-[0.8rem] leading-relaxed",
          accent
            ? "bg-accent/10 text-card-foreground ring-1 ring-accent/20"
            : "bg-secondary text-card-foreground",
        )}
      >
        {text}
        {cite ? (
          <span className="mt-1.5 flex items-center gap-1 text-[0.68rem] font-medium text-accent">
            <span aria-hidden="true" className="size-1 rounded-full bg-accent" />
            {cite}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Mock chat used as hero visual. Purely decorative — hidden from a11y tree.
 */
export function HeroVisual({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-full max-w-md",
        "rounded-3xl border border-border/70 bg-card/80 p-4 shadow-[0_32px_64px_-32px_rgb(0_0_0_/_0.4)] backdrop-blur",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-accent/60" />
          <span className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="ml-2 text-xs font-medium text-muted-foreground">
          estudio@contadores
        </span>
      </div>
      <div className="flex flex-col gap-3">{DEFAULT_ITEMS}</div>
    </div>
  );
}