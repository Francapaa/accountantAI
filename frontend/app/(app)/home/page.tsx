import { requireAuth } from "@/lib/auth";
import { getClients } from "@/lib/clients";
import { getWhatsAppConnections, getWhatsAppInbox, getWebhookUrl } from "@/lib/whatsapp";

import { ClientGrid } from "./components";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireAuth();
  const [clients, connections, inbox] = await Promise.all([
    getClients(),
    getWhatsAppConnections(),
    getWhatsAppInbox(),
  ]);

  const name =
    typeof user.user_metadata?.name === "string" && user.user_metadata.name
      ? user.user_metadata.name
      : undefined;

  return (
    <ClientGrid
      userName={name}
      clients={clients}
      whatsappConnections={connections}
      whatsappInbox={inbox}
      webhookUrl={getWebhookUrl()}
    />
  );
}
