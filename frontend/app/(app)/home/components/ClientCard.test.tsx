import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { Client } from "@/lib/clients";

import { ClientCard } from "./ClientCard";

const CLIENT: Client = {
  id: "client-1",
  owner_id: "owner-1",
  name: "Juan Pérez",
  province: "Córdoba",
  tax_regime: "Monotributo",
  activity: "Comercio",
  notes_public: null,
  created_at: "2026-08-06T00:00:00Z",
  updated_at: "2026-08-06T00:00:00Z",
};

describe("ClientCard", () => {
  it("muestra el nombre del cliente", () => {
    render(<ClientCard client={CLIENT} index={0} />);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  it("linkea al chat del cliente", () => {
    render(<ClientCard client={CLIENT} index={0} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/clients/client-1");
  });

  it("muestra los badges de contexto cuando existen", () => {
    render(<ClientCard client={CLIENT} index={0} />);
    expect(screen.getByText("Monotributo")).toBeInTheDocument();
    expect(screen.getByText("Córdoba")).toBeInTheDocument();
    expect(screen.getByText("Comercio")).toBeInTheDocument();
  });

  it("no muestra badges cuando no hay contexto", () => {
    const bareClient: Client = { ...CLIENT, tax_regime: null, province: null, activity: null };
    render(<ClientCard client={bareClient} index={0} />);
    expect(screen.queryByText("Monotributo")).not.toBeInTheDocument();
  });
});
