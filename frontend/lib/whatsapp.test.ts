import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSupabaseServerClient } from "@/lib/supabase/server";

import { getWebhookUrl, getWhatsAppConnections, getWhatsAppInbox } from "./whatsapp";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/backend", () => ({
  BACKEND_URL: "http://test-backend",
}));

type Result = { data: unknown; error: unknown };

function mockClient(results: Result[] = []) {
  const queued = [...results];
  const eq = vi.fn();
  const select = vi.fn();
  const order = vi.fn();

  const chain = {
    select: (...args: unknown[]) => {
      select(...args);
      return chain;
    },
    eq: (...args: unknown[]) => {
      eq(...args);
      return chain;
    },
    order: (...args: unknown[]) => {
      order(...args);
      return chain;
    },
    then: (resolve: (value: unknown) => void) => {
      resolve(queued.shift() ?? { data: [], error: null });
    },
  };

  const from = vi.fn().mockReturnValue(chain);
  const supabase = { from };
  vi.mocked(getSupabaseServerClient).mockReturnValue(supabase as never);
  return { from, select, eq, order };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetModules();
});

describe("getWebhookUrl", () => {
  it("apunta al webhook público de whatsapp", () => {
    expect(getWebhookUrl()).toBe("http://test-backend/api/whatsapp/webhook");
  });
});

describe("getWhatsAppConnections", () => {
  it("consulta la tabla whatsapp_connections y ordena por creación", async () => {
    const { from, select, order } = mockClient();

    await getWhatsAppConnections();

    expect(from).toHaveBeenCalledWith("whatsapp_connections");
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("lanza un error cuando Supabase devuelve un error", async () => {
    mockClient([{ data: null, error: { message: "RLS blocked" } }]);

    await expect(getWhatsAppConnections()).rejects.toThrow("RLS blocked");
  });
});

describe("getWhatsAppInbox", () => {
  const inbound = {
    id: "in-1",
    content: "Hola, necesito mi factura",
    created_at: "2026-08-07T12:00:00Z",
    status: "received",
    reply_to_message_id: null,
    conversations: { id: "conv-1", title: "Juan", clients: [{ name: "Juan Pérez" }] },
  };
  const draft = {
    id: "dr-1",
    content: "Te la envío en un momento.",
    reply_to_message_id: "in-1",
  };

  it("trae mensajes entrantes recibidos y adjunta su borrador por reply_to", async () => {
    const { from, select, eq } = mockClient([
      { data: [inbound], error: null },
      { data: [draft], error: null },
    ]);

    const inbox = await getWhatsAppInbox();

    expect(from).toHaveBeenCalledWith("messages");
    expect(select).toHaveBeenCalledTimes(2);
    expect(eq).toHaveBeenCalledWith("direction", "inbound");
    expect(eq).toHaveBeenCalledWith("status", "received");
    expect(eq).toHaveBeenCalledWith("direction", "outbound");
    expect(eq).toHaveBeenCalledWith("status", "draft");

    expect(inbox).toHaveLength(1);
    expect(inbox[0]).toMatchObject({
      id: "in-1",
      conversation_id: "conv-1",
      client_name: "Juan Pérez",
      draft_id: "dr-1",
      draft_content: "Te la envío en un momento.",
    });
  });

  it("deja draft vacío cuando no hay respuesta del accountant", async () => {
    const { from, select } = mockClient([
      { data: [{ ...inbound, conversations: null }], error: null },
      { data: [], error: null },
    ]);

    const inbox = await getWhatsAppInbox();

    expect(from).toHaveBeenCalledWith("messages");
    expect(select).toHaveBeenCalledTimes(2);

    expect(inbox).toHaveLength(1);
    expect(inbox[0]?.draft_id).toBeNull();
    expect(inbox[0]?.draft_content).toBeNull();
    expect(inbox[0]?.conversation_id).toBe("");
    expect(inbox[0]?.client_name).toBeNull();
  });

  it("lanza un error cuando la consulta inbound falla", async () => {
    mockClient([{ data: null, error: { message: "RLS blocked" } }, { data: [], error: null }]);

    await expect(getWhatsAppInbox()).rejects.toThrow("RLS blocked");
  });
});