import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";

export function Cta() {
  return (
    <section className="border-t bg-primary py-20 text-primary-foreground">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Recuperá tu tiempo para el trabajo que importa
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80">
          Sumate a la lista de espera y enterate primero cuando esté disponible.
        </p>
        <a
          href={`mailto:${siteConfig.contactEmail}?subject=Solicito%20acceso%20a%20AccountantAI`}
          className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-8")}
        >
          Solicitar acceso temprano
        </a>
      </div>
    </section>
  );
}
