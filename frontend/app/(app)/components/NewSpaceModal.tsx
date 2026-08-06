"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import { NewSpaceForm } from "./NewSpaceForm";

type NewSpaceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function NewSpaceModal({ open, onOpenChange, onSuccess }: NewSpaceModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity duration-150 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0 data-open:animate-in data-open:fade-in data-closed:animate-out data-closed:fade-out"
        />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4 transition-[opacity,transform] duration-200 ease-out data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:translate-y-2 data-ending-style:opacity-0 sm:px-0">
          <div className="max-h-[90dvh] overflow-y-auto rounded-2xl border border-border/60 bg-card p-6 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.25)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  Nuevo espacio
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  Creá un chat por cliente con su contexto persistente.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Cerrar"
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <div className="mt-6">
              <NewSpaceForm onSuccess={onSuccess} />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
