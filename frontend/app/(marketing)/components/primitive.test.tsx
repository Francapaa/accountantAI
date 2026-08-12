import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountUp } from "./count-up";
import { Marquee } from "./marquee";

describe("CountUp", () => {
  it("formatea el valor final con su sufijo una vez visible", () => {
    render(<CountUp value={100} suffix="%" />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("aplica formato numérico en es-AR", () => {
    render(<CountUp value={4800} />);
    expect(screen.getByText("4.800")).toBeInTheDocument();
  });
});

describe("Marquee", () => {
  const items = [
    { id: "a", label: "¿Ya puedo facturar?" },
    { id: "b", label: "¿Cuándo vence el monotributo?" },
  ];

  it("expone el rol marquee con su label accesible", () => {
    render(<Marquee items={items} ariaLabel="Consultas típicas" />);
    expect(
      screen.getByRole("marquee", { name: "Consultas típicas" }),
    ).toBeInTheDocument();
  });

  it("duplica la fila para el bucle continuo", () => {
    render(<Marquee items={items} />);
    expect(screen.getAllByText("¿Ya puedo facturar?")).toHaveLength(2);
  });
});