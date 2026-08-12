import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookVisual } from "./book-visual";

describe("BookVisual", () => {
  it("es decorativo: wrapper aria-hidden sin textos legibles", () => {
    const { container } = render(<BookVisual />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.closest("[aria-hidden='true']")).not.toBeNull();
    expect(container.querySelector("text")).toBeNull();
  });

  it("se divide en dos mitades cerradas por defecto sobre el lomo", () => {
    const { container } = render(<BookVisual />);
    const halves = container.querySelectorAll("[data-book-half]");
    expect(halves).toHaveLength(2);
    halves.forEach((half) => {
      expect(half.getAttribute("style") ?? "").toContain("rotateY(84deg)");
      expect(half.className).toMatch(/overflow-hidden/);
    });
  });

  it("aplica className y nunca captura eventos", () => {
    const { container } = render(<BookVisual className="w-72" />);
    const wrapper = container.querySelector("[aria-hidden='true']");
    expect(wrapper).toHaveClass("pointer-events-none");
    expect(wrapper).toHaveClass("w-72");
  });
});