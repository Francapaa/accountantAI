import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Header } from "./header";

describe("Header", () => {
  it("expone enlaces a ingresar y empezá gratis", () => {
    render(<Header />);
    expect(
      screen.getAllByRole("link", { name: /ingresar/i }).length,
    ).toBeGreaterThan(0);
    const signUp = screen.getAllByRole("link", { name: /empezá gratis/i });
    expect(signUp.length).toBeGreaterThan(0);
    expect(signUp[0]).toHaveAttribute("href", "/auth/sign-up");
  });

  it("alterna el menú mobile con el botón", () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /abrir menú/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    const toggleClosed = screen.getByRole("button", { name: /cerrar menú/i });
    expect(toggleClosed).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggleClosed);
    expect(screen.getByRole("button", { name: /abrir menú/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("cierra el menú mobile al elegir un enlace", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /abrir menú/i }));

    const menu = screen.getByRole("navigation", { name: /menú principal móvil/i });
    fireEvent.click(within(menu).getByRole("link", { name: /funcionalidades/i }));

    expect(screen.getByRole("button", { name: /abrir menú/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});