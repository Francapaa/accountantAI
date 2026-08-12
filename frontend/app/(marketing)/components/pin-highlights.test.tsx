import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PinHighlights } from "./pin-highlights";

vi.mock("./count-up", () => ({
  CountUp: ({ value, suffix }: { value: number; suffix?: string }) => (
    <span>{`${value}${suffix ?? ""}`}</span>
  ),
}));

describe("PinHighlights", () => {
  it("muestra las tres métricas con su etiqueta", () => {
    render(<PinHighlights />);
    expect(
      screen.getAllByText(/ahorradas por semana en consultas repetitivas/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/respuestas con cita a la normativa/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/carpeta por cliente con su historial/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("48 h")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renderiza como banda estática accesible (dl)", () => {
    render(<PinHighlights />);
    expect(document.querySelector("dl")).not.toBeNull();
    expect(screen.getByRole("region").getAttribute("aria-label")).toMatch(
      /impacto en horas/i,
    );
  });

  it("no rompe bajo prefers-reduced-motion (matchMedia stub)", () => {
    render(<PinHighlights />);
    expect(screen.getByText("48 h")).toBeInTheDocument();
  });

  it("incluye el libro decorativo detrás de la banda, cerrado en dos mitades", () => {
    render(<PinHighlights />);
    const book = document.querySelector("[data-book]");
    expect(book).not.toBeNull();
    expect(book?.getAttribute("aria-hidden")).toBe("true");
    expect(book?.querySelector("svg")).not.toBeNull();
    expect(book?.querySelectorAll("[data-book-half]")).toHaveLength(2);
  });
});