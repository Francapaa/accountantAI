import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FAQ_TITLE, Faq, faqItems } from "./faq";
import { HowItWorks } from "./how-it-works";

describe("Faq", () => {
  it("muestra todas las preguntas", () => {
    render(<Faq />);
    for (const item of faqItems) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    }
  });

  it("tiene el título de la sección", () => {
    render(<Faq />);
    expect(screen.getByText(FAQ_TITLE)).toBeInTheDocument();
  });
});

describe("HowItWorks", () => {
  it("muestra los tres pasos", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Cargá tu lista de clientes")).toBeInTheDocument();
    expect(screen.getByText("Hacé tu consulta")).toBeInTheDocument();
    expect(screen.getByText("Verificá y respondé")).toBeInTheDocument();
  });

  it("identifica la sección por su ancla", () => {
    render(<HowItWorks />);
    expect(document.querySelector('section[id="como-funciona"]')).not.toBeNull();
  });
});