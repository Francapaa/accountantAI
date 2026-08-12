import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Problem } from "./problem";

describe("Problem", () => {
  it("describe el problema de las consultas repetidas", () => {
    render(<Problem />);
    expect(
      screen.getByText(/consultas que se repiten/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /Tu día está lleno de consultas que se repiten/i,
    );
  });

  it("incluye el marquee con consultas típicas", () => {
    render(<Problem />);
    expect(
      screen.getByRole("marquee", {
        name: /consultas típicas de un estudio contable/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/¿Ya puedo facturar\?/i).length).toBeGreaterThan(0);
  });

  it("la fila del marquee es decorativa (aria-hidden)", () => {
    render(<Problem />);
    const row = document.querySelector('[aria-hidden="true"]');
    expect(row).not.toBeNull();
  });
});