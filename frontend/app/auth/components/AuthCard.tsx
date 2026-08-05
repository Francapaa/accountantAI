import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthCardProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Shared shell for auth pages: centered card with a fading, rising entrance.
 */
export function AuthCard({
  icon,
  title,
  description,
  footer,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "animate-scale-in w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.25)] backdrop-blur-sm",
        className,
      )}
    >
      {icon && (
        <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          {icon}
        </div>
      )}
      <div className="animate-rise-in">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="mt-8">{children}</div>
      {footer && (
        <div className="animate-fade-in mt-8">{footer}</div>
      )}
    </div>
  );
}