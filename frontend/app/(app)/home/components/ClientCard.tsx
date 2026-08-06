"use client";

import Link from "next/link";
import { ArrowUpRight, MessageSquare } from "lucide-react";

import { Badge } from "@/lib/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Client } from "@/lib/clients";

type ClientCardProps = {
  client: Client;
  index: number;
};

export function ClientCard({ client, index }: ClientCardProps) {
  const badges = [client.tax_regime, client.province, client.activity].filter(
    (value): value is string => Boolean(value),
  );

  return (
    <Link
      href={`/clients/${client.id}`}
      className={cn(
        "animate-rise-in group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur-sm",
        "transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-[0_16px_40px_-20px_rgb(0_0_0/0.2)]",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <MessageSquare className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
          {client.name}
        </h3>
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
        Abrir chat
      </span>
    </Link>
  );
}
