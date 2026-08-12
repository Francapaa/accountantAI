import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Hero } from "./hero";

// CountUp uses matchMedia; setup stubs it globally.
vi.mock("./hero-visual", () => ({
  HeroVisual: () => <div data-testid="hero-visual" />,
}));

describe("Hero", () => {
  it("incluye el título con la mención a ARCA/AFIP", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    const text = heading.textContent?.replace(/\s+/g, " ").trim() ?? "";
    expect(text).toContain("Tu asistente de IA para contadores");
    expect(text).toContain("normativa de ARCA/AFIP");
  });

  it("muestra el badge de posicionamiento", () => {
    render(<Hero />);
    expect(
      screen.getByText(/estudios contables de Argentina/i),
    ).toBeInTheDocument();
  });

  it("incluye las palabras del título en orden (word-stagger)", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    const words = [
      "Tu",
      "asistente",
      "de",
      "IA",
      "para",
      "contadores,",
      "respaldado",
      "en",
      "la",
      "normativa",
      "de",
      "ARCA/AFIP",
    ];
    const text = heading.textContent;
    const normalized = text?.replace(/\s+/g, " ").trim() ?? "";
    let cursor = 0;
    for (const word of words) {
      const idx = normalized.indexOf(word, cursor);
      expect(idx).toBeGreaterThanOrEqual(0);
      cursor = idx + word.length;
    }
  });

  it("enlaza a creación de cuenta y a funcionalidades", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /crear cuenta gratis/i })).toHaveAttribute(
      "href",
      "/auth/sign-up",
    );
    expect(screen.getByRole("link", { name: /ver funcionalidades/i })).toHaveAttribute(
      "href",
      "#funcionalidades",
    );
  });
});