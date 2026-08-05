import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { buttonVariants } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";

import { AuthCard } from "../components";

export default function AuthCodeErrorPage() {
  return (
    <AuthCard
      icon={<TriangleAlert className="size-5 text-destructive" />}
      title="El enlace no es válido"
      description="El enlace que usaste es inválido o ya expiró. Volvé a intentarlo."
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