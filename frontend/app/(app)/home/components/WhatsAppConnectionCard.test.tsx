import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { WhatsAppConnection } from "@/lib/whatsapp";

import { WhatsAppConnectionCard } from "./WhatsAppConnectionCard";

const unlinkWhatsAppConnection = vi.fn();
const linkWhatsAppConnection = vi.fn();

vi.mock("../../whatsapp/actions", () => ({
  unlinkWhatsAppConnection: (...args: unknown[]) => unlinkWhatsAppConnection(...args),
  linkWhatsAppConnection: (...args: unknown[]) => linkWhatsAppConnection(...args),
}));

const CONNECTED: WhatsAppConnection = {
  id: "conn-1",
  provider: "meta",
  waba_id: "waba-1",
  phone: "+54 9 11 5555-3333",
  phone_number_id: "1225021210",
  status: "connected",
};

const WEBHOOK_URL = "https://api.example.com/api/whatsapp/webhook";

describe("WhatsAppConnectionCard", () => {
  beforeEach(() => {
    unlinkWhatsAppConnection.mockClear();
  });

  it("ofrece enlazar un número cuando no hay conexión", () => {
    render(<WhatsAppConnectionCard connections={[]} webhookUrl={WEBHOOK_URL} />);

    expect(screen.getByText("Conexión WhatsApp")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enlazar número" }),
    ).toBeInTheDocument();
  });

  it("muestra el webhook público a configurar en Meta", () => {
    render(<WhatsAppConnectionCard connections={[]} webhookUrl={WEBHOOK_URL} />);

    expect(screen.getByText(WEBHOOK_URL)).toBeInTheDocument();
  });

  it("abre el modal de enlace al hacer clic en el botón", async () => {
    const user = userEvent.setup();
    render(<WhatsAppConnectionCard connections={[]} webhookUrl={WEBHOOK_URL} />);

    await user.click(screen.getByRole("button", { name: "Enlazar número" }));

    expect(await screen.findByLabelText("Número de WhatsApp")).toBeInTheDocument();
  });

  it("muestra el número cuando hay una conexión activa", () => {
    render(<WhatsAppConnectionCard connections={[CONNECTED]} webhookUrl={WEBHOOK_URL} />);

    expect(screen.getByText(CONNECTED.phone!)).toBeInTheDocument();
    expect(screen.getByText("Conectado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /desenlazar/i })).toBeInTheDocument();
  });

  it("desenlaza la conexión desde el botón", async () => {
    const user = userEvent.setup();
    render(<WhatsAppConnectionCard connections={[CONNECTED]} webhookUrl={WEBHOOK_URL} />);

    await user.click(screen.getByRole("button", { name: /desenlazar/i }));

    expect(unlinkWhatsAppConnection).toHaveBeenCalledTimes(1);
  });
});