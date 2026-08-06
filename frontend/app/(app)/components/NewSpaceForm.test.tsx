import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NewSpaceForm } from "./NewSpaceForm";

const createClient = vi.fn();

vi.mock("../actions", () => ({
  createClient: (...args: unknown[]) => createClient(...args),
}));

describe("NewSpaceForm", () => {
  it("requiere un nombre de cliente", () => {
    createClient.mockResolvedValue({
      error: "Ingresá el nombre del cliente.",
    });
    render(<NewSpaceForm onSuccess={() => {}} />);

    expect(screen.getByLabelText("Nombre del cliente")).toBeRequired();
    expect(screen.getByRole("button", { name: /crear espacio/i })).toBeInTheDocument();
  });

  it("ofrece las provincias y regímenes fiscales", () => {
    render(<NewSpaceForm onSuccess={() => {}} />);

    expect(screen.getByLabelText("Provincia")).toBeInTheDocument();
    expect(screen.getByText("Córdoba")).toBeInTheDocument();
    expect(screen.getByText("Buenos Aires")).toBeInTheDocument();

    expect(screen.getByLabelText("Régimen fiscal")).toBeInTheDocument();
    expect(screen.getByText("Monotributo")).toBeInTheDocument();
    expect(screen.getByText("Responsable Inscripto")).toBeInTheDocument();
  });

  it("muestra el error de la acción en un alert", async () => {
    const user = userEvent.setup();
    createClient.mockResolvedValue({ error: "La base no respondió." });

    render(<NewSpaceForm onSuccess={() => {}} />);

    await user.type(screen.getByLabelText("Nombre del cliente"), "Juan Pérez");
    await user.click(screen.getByRole("button", { name: /crear espacio/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("La base no respondió.");
  });

  it("llama a onSuccess cuando la creación tiene éxito", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    createClient.mockResolvedValue({ success: true });

    render(<NewSpaceForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Nombre del cliente"), "Juan Pérez");
    await user.click(screen.getByRole("button", { name: /crear espacio/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
