import type { Metadata } from "next";

import { Logo } from "@/app/(marketing)/components/logo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "Cuenta",
    template: "%s | AccountantAI",
  },
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Soft background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-8 px-4 py-12">
        <div className="animate-rise-in">
          <Logo />
        </div>
        {children}
      </div>

      <footer className="z-10 pb-6 text-center text-xs text-muted-foreground">
        <p
          className={cn(
            "mx-auto max-w-md px-6",
            "text-muted-foreground/80",
          )}
        >
          Asistente de IA para estudios contables, con respaldo en normativa
          oficial de ARCA/AFIP.
        </p>
      </footer>
    </div>
  );
}