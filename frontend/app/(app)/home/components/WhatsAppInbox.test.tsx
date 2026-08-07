import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { InboxMessage } from "@/lib/whatsapp";

import { WhatsAppInbox } from "./WhatsAppInbox";

const saveDraft = vi.fn();
const approveDraft = vi.fn();

vi.mock("../../whatsapp/actions", () => ({
  saveDraft: (...args: unknown[]) => saveDraft(...args),
  approveDraft: (...args: unknown[]) => approveDraft(...args),
}));

const RECEIVED: InboxMessage = {
  id: "in-1",
  conversation_id: "conv-1",
  content: "Hola, necesito mi factura",
  created_at: "2026-08-07T12:00:00Z",
  client_name: "Juan Pérez",
  status: "received",
  draft_id: null,
  draft_content: null,
};

const WITH_DRAFT: InboxMessage = {
  ...RECEIVED,
  id: "in-2",
  content: "¿Cuándo puedo pasar por el estudio?",
  draft_id: "dr-2",
  draft_content: "El lunes de 9 a 13hs.",
};

describe("WhatsAppInbox", () => {
  beforeEach(() => {
    saveDraft.mockClear();
    approveDraft.mockClear();
    saveDraft.mockResolvedValue({ success: true });
    approveDraft.mockResolvedValue({ success: true });
  });

  it("no renderiza nada cuando no hay mensajes", () => {
    const { container } = render(<WhatsAppInbox messages={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el mensaje recibido y el cliente", () => {
    render(<WhatsAppInbox messages={[RECEIVED]} />);

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Hola, necesito mi factura")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar borrador/i }),
    ).toBeInTheDocument();
  });

  it("guarda el borrador con la respuesta del accountant", async () => {
    const user = userEvent.setup();
    render(<WhatsAppInbox messages={[RECEIVED]} />);

    await user.type(screen.getByLabelText("Tu respuesta (borrador)"), "Te la envío ya.");
    await user.click(screen.getByRole("button", { name: /guardar borrador/i }));

    expect(saveDraft).toHaveBeenCalledTimes(1);
  });

  it("muestra el borrador guardado y ofrece aprobar el envío", () => {
    render(<WhatsAppInbox messages={[WITH_DRAFT]} />);

    expect(screen.getByText("Borrador — no enviado")).toBeInTheDocument();
    expect(screen.getByText("El lunes de 9 a 13hs.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aceptar y enviar/i })).toBeInTheDocument();
  });

  it("aprueba y envía el borrador", async () => {
    const user = userEvent.setup();
    render(<WhatsAppInbox messages={[WITH_DRAFT]} />);

    await user.click(screen.getByRole("button", { name: /aceptar y enviar/i }));

    expect(approveDraft).toHaveBeenCalledTimes(1);
  });

  it("muestra el error de la acción en un alert", async () => {
    saveDraft.mockResolvedValue({ error: "No se pudo guardar el borrador." });

    const user = userEvent.setup();
    render(<WhatsAppInbox messages={[RECEIVED]} />);

    await user.type(screen.getByLabelText("Tu respuesta (borrador)"), "Hola");
    await user.click(screen.getByRole("button", { name: /guardar borrador/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo guardar el borrador.",
    );
  });
});