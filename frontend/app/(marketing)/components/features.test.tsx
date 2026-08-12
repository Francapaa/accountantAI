import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Cta } from "./cta";
import { Features } from "./features";

const featureTitles = [
  "Basado en normativa oficial",
  "Citas a la normativa",
  "Carpeta por cliente",
  "Contexto persistente",
  "Historial completo por cliente",
  "Resúmenes y notas internas",
];

describe("Features", () => {
  it("muestra las seis funcionalidades", () => {
    render(<Features />);
    for (const title of featureTitles) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("identifica la sección por su ancla", () => {
    render(<Features />);
    expect(document.querySelector('section[id="funcionalidades"]')).not.toBeNull();
  });
});

describe("Cta", () => {
  it("enlaza a creación de cuenta y a inicio de sesión", () => {
    render(<Cta />);
    expect(screen.getByRole("link", { name: /crear cuenta gratis/i })).toHaveAttribute(
      "href",
      "/auth/sign-up",
    );
    expect(screen.getByRole("link", { name: /ya tengo una cuenta/i })).toHaveAttribute(
      "href",
      "/auth/sign-in",
    );
  });

  it("recupera el tiempo como mensaje principal", () => {
    render(<Cta />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /Recuperá tu tiempo para el trabajo que importa/i,
    );
  });
});