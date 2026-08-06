import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import { getClients } from "./clients";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: vi.fn(),
}));

function mockQuery({ data = null, error = null }: { data?: unknown; error?: unknown } = {}) {
  const order = vi.fn().mockResolvedValue({ data, error } satisfies { data: unknown; error: unknown });
  const select = vi.fn().mockReturnValue({ order });
  const from = vi.fn().mockReturnValue({ select });
  const supabase = { from };
  vi.mocked(getSupabaseServerClient).mockReturnValue(supabase as never);
  return { from, select, order };
}

const ROW = {
  id: "client-1",
  owner_id: "owner-1",
  name: "Juan Pérez",
  province: "Córdoba",
  tax_regime: "Monotributo",
  activity: "Comercio",
  notes_public: null,
  created_at: "2026-08-06T00:00:00Z",
  updated_at: "2026-08-06T00:00:00Z",
};

describe("getClients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("consulta la tabla clients y ordena por nombre ascendente", async () => {
    const { from, select, order } = mockQuery({ data: [ROW] });

    const clients = await getClients();

    expect(from).toHaveBeenCalledWith("clients");
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("name", { ascending: true });
    expect(clients).toEqual([ROW]);
  });

  it("lanza un error cuando Supabase devuelve un error", async () => {
    mockQuery({ error: { message: "RLS blocked" } });

    await expect(getClients()).rejects.toThrow("RLS blocked");
  });

  it("devuelve una lista vacía cuando no hay datos", async () => {
    mockQuery({ data: null });

    await expect(getClients()).resolves.toEqual([]);
  });
});
