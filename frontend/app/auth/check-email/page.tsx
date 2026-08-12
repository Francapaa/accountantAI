import Link from "next/link";
import { MailCheck } from "lucide-react";

import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

import { AuthCard } from "../components";
import { authPageMetadata } from "../metadata";

export const metadata = authPageMetadata.checkEmail;

export default function CheckEmailPage() {
  return (
    <AuthCard
      icon={<MailCheck className="size-5" />}
      title="Revisá tu email"
      description="Te enviamos un link de confirmación. Hacé clic en él para activar tu cuenta y después iniciá sesión."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          ¿No recibiste el email?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Intentá de nuevo
          </Link>
        </p>
      }
    >
      <div className="animate-rise-in">
        <Link
          href="/auth/sign-in"
          className={cn(buttonVariants(), "w-full")}
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </AuthCard>
  );
}