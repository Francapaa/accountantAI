import { describe, expect, it } from "vitest";

import { legalPageMetadata } from "./metadata";

describe("legalPageMetadata", () => {
  const entries = Object.entries(legalPageMetadata);

  it("define metadata para las 4 páginas", () => {
    expect(entries.map(([key]) => key).sort()).toEqual(
      ["acerca", "contacto", "privacidad", "terminos"].sort(),
    );
  });

  it("cada página tiene title y description no vacíos", () => {
    for (const [, metadata] of entries) {
      expect(metadata.title?.length).toBeGreaterThan(0);
      expect(metadata.description?.length).toBeGreaterThan(0);
    }
  });

  it("los títulos son únicos entre páginas", () => {
    const titles = entries.map(([, metadata]) => metadata.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});