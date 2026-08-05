import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold", className)}
      aria-label="AccountantAI — inicio"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-5"
        >
          <path
            d="M4 5.5h13A1.5 1.5 0 0 1 18.5 7v10a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 17V5.5H4Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 9.5h7M8 13h4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-lg tracking-tight">
        Accountant<span className="text-primary">AI</span>
      </span>
    </Link>
  );
}
