import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WhatsAppLinkForm } from "./WhatsAppLinkForm";

const linkWhatsAppConnection = vi.fn();

vi.mock("../../whatsapp/actions", () => ({
  linkWhatsAppConnection: (...args: unknown[]) => linkWhatsAppConnection(...args),
}));

describe("WhatsAppLinkForm", () => {
  beforeEach(() => {
    linkWhatsAppConnection.mockClear();
    linkWhatsAppConnection.mockResolvedValue({ success: true });
  });

  it("requiere el número y los ids de la plataforma", () => {
    render(<WhatsAppLinkForm onSuccess={() => {}} />);

    expect(screen.getByLabelText("Número de WhatsApp")).toBeRequired();
    expect(screen.getByLabelText("phone_number_id")).toBeRequired();
    expect(screen.getByLabelText("waba_id (Business Account)")).toBeRequired();
    expect(screen.getByRole("button", { name: /enlazar número/i })).toBeInTheDocument();
  });

  it("muestra el error de la acción en un alert", async () => {
    linkWhatsAppConnection.mockResolvedValue({ error: "La plataforma no respondió." });

    const user = userEvent.setup();
    render(<WhatsAppLinkForm onSuccess={() => {}} />);

    await user.type(screen.getByLabelText("Número de WhatsApp"), "+54 9 11 5555-3333");
    await user.type(screen.getByLabelText("phone_number_id"), "1225021210");
    await user.type(screen.getByLabelText("waba_id (Business Account)"), "4484505135201243");
    await user.click(screen.getByRole("button", { name: /enlazar número/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La plataforma no respondió.",
    );
  });

  it("llama a onSuccess cuando el enlace se registra", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<WhatsAppLinkForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Número de WhatsApp"), "+54 9 11 5555-3333");
    await user.type(screen.getByLabelText("phone_number_id"), "1225021210");
    await user.type(screen.getByLabelText("waba_id (Business Account)"), "4484505135201243");
    await user.click(screen.getByRole("button", { name: /enlazar número/i }));

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});