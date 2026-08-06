import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Client } from "@/lib/clients";

import { SidebarDrawer } from "./SidebarDrawer";

const openNewSpace = vi.fn();

vi.mock("./NewSpaceProvider", () => ({
  useNewSpace: () => ({ openNewSpace }),
}));

const CLIENTS: Client[] = [
  {
    id: "client-1",
    owner_id: "owner-1",
    name: "Juan Pérez",
    province: null,
    tax_regime: "Monotributo",
    activity: null,
    notes_public: null,
    created_at: "2026-08-06T00:00:00Z",
    updated_at: "2026-08-06T00:00:00Z",
  },
];

describe("SidebarDrawer", () => {
  beforeEach(() => {
    openNewSpace.mockClear();
  });

  it("lista los espacios del usuario", () => {
    render(<SidebarDrawer open clients={CLIENTS} onClose={() => {}} />);

    expect(screen.getByRole("link", { name: /Juan Pérez/i })).toHaveAttribute(
      "href",
      "/clients/client-1",
    );
    expect(screen.getByText("Monotributo")).toBeInTheDocument();
  });

  it("muestra un mensaje cuando no hay espacios", () => {
    render(<SidebarDrawer open clients={[]} onClose={() => {}} />);

    expect(screen.getByText(/todavía no tenés espacios/i)).toBeInTheDocument();
  });

  it("abre el modal de nuevo espacio", async () => {
    const user = userEvent.setup();
    render(<SidebarDrawer open clients={CLIENTS} onClose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /nuevo espacio/i }));

    expect(openNewSpace).toHaveBeenCalledTimes(1);
  });

  it("cierra el drawer desde el botón de cierre", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SidebarDrawer open clients={CLIENTS} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Cerrar menú" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
