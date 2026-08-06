import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Client } from "@/lib/clients";

import { ClientGrid } from "./ClientGrid";

const openNewSpace = vi.fn();

vi.mock("@/app/(app)/components/NewSpaceProvider", () => ({
  useNewSpace: () => ({ openNewSpace }),
}));

const CLIENTS: Client[] = [
  {
    id: "client-1",
    owner_id: "owner-1",
    name: "Juan Pérez",
    province: "Córdoba",
    tax_regime: "Monotributo",
    activity: "Comercio",
    notes_public: null,
    created_at: "2026-08-06T00:00:00Z",
    updated_at: "2026-08-06T00:00:00Z",
  },
  {
    id: "client-2",
    owner_id: "owner-1",
    name: "Estudio Rodríguez",
    province: "Buenos Aires",
    tax_regime: "Responsable Inscripto",
    activity: "Servicios",
    notes_public: null,
    created_at: "2026-08-06T00:00:00Z",
    updated_at: "2026-08-06T00:00:00Z",
  },
];

describe("ClientGrid", () => {
  beforeEach(() => {
    openNewSpace.mockClear();
  });

  it("saluda al usuario por su nombre", () => {
    render(<ClientGrid userName="María" clients={CLIENTS} />);
    expect(screen.getByRole("heading", { name: /Hola, María/i })).toBeInTheDocument();
  });

  it("muestra todos los clientes inicialmente", () => {
    render(<ClientGrid userName="" clients={CLIENTS} />);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Estudio Rodríguez")).toBeInTheDocument();
  });

  it("filtra la lista por nombre mientras se escribe", async () => {
    const user = userEvent.setup();
    render(<ClientGrid userName="" clients={CLIENTS} />);

    await user.type(screen.getByLabelText("Buscar cliente"), "juan");

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Estudio Rodríguez")).not.toBeInTheDocument();
  });

  it("muestra un estado vacío cuando la búsqueda no coincide", async () => {
    const user = userEvent.setup();
    render(<ClientGrid userName="" clients={CLIENTS} />);

    await user.type(screen.getByLabelText("Buscar cliente"), "zzz");

    expect(screen.getByText(/no hay clientes que coincidan/i)).toBeInTheDocument();
  });

  it("muestra un CTA para crear el primer espacio cuando no hay clientes", () => {
    render(<ClientGrid userName="" clients={[]} />);
    expect(screen.getByText("Creá tu primer espacio")).toBeInTheDocument();
  });

  it("abre el modal de nuevo espacio desde el CTA vacío", async () => {
    const user = userEvent.setup();
    render(<ClientGrid userName="" clients={[]} />);

    await user.click(screen.getByRole("button", { name: /crear espacio/i }));

    expect(openNewSpace).toHaveBeenCalledTimes(1);
  });

  it("abre el modal desde el botón de la lista", async () => {
    const user = userEvent.setup();
    render(<ClientGrid userName="" clients={CLIENTS} />);

    await user.click(screen.getByRole("button", { name: /nuevo espacio/i }));

    expect(openNewSpace).toHaveBeenCalledTimes(1);
  });
});
