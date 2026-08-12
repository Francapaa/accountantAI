import { describe, expect, it } from "vitest";

import { authPageMetadata } from "./metadata";

describe("authPageMetadata", () => {
  const entries = Object.entries(authPageMetadata);

  it("define metadata para las 6 páginas de auth", () => {
    expect(entries.map(([key]) => key).sort()).toEqual(
      [
        "authCodeError",
        "checkEmail",
        "forgotPassword",
        "signIn",
        "signUp",
        "updatePassword",
      ].sort(),
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