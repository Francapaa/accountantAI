"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { NewSpaceModal } from "./NewSpaceModal";

type NewSpaceContextValue = {
  openNewSpace: () => void;
};

const NewSpaceContext = createContext<NewSpaceContextValue | null>(null);

/**
 * Provides a single "create space" dialog to the whole app shell, so the
 * drawer button and the home grid CTA share the same modal.
 */
export function NewSpaceProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openNewSpace = useCallback(() => setOpen(true), []);
  const closeNewSpace = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openNewSpace }), [openNewSpace]);

  return (
    <NewSpaceContext.Provider value={value}>
      {children}
      <NewSpaceModal open={open} onOpenChange={setOpen} onSuccess={closeNewSpace} />
    </NewSpaceContext.Provider>
  );
}

export function useNewSpace(): NewSpaceContextValue {
  const ctx = useContext(NewSpaceContext);
  if (!ctx) {
    throw new Error("useNewSpace must be used within a NewSpaceProvider");
  }
  return ctx;
}
