import { describe, expect, it } from "vitest";

import { createClientSchema } from "./schema";

describe("createClientSchema", () => {
  it("acepta solo el nombre obligatorio", () => {
    const result = createClientSchema.safeParse({ name: "Estudio Rodríguez" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Estudio Rodríguez");
      expect(result.data.province).toBeUndefined();
    }
  });

  it("acepta el contexto completo", () => {
    const result = createClientSchema.safeParse({
      name: "  Juan Pérez  ",
      province: "Córdoba",
      tax_regime: "Monotributo",
      activity: "Comercio",
      notes_public: "Cliente minorista",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Juan Pérez");
      expect(result.data.province).toBe("Córdoba");
    }
  });

  it("rechaza un nombre vacío", () => {
    const result = createClientSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rechaza campos que exceden el largo máximo", () => {
    const result = createClientSchema.safeParse({
      name: "a".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it("trata strings vacíos de contexto como undefined", () => {
    const result = createClientSchema.safeParse({
      name: "Cliente",
      province: "",
      activity: "   ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.province).toBe("");
    }
  });
});
