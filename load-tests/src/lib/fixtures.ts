/**
 * Realistic payloads for the AccountantAI endpoints under test.
 * Shipping these next to the tests keeps the HTTP bodies honest and
 * consistent with the backend SDDs (docs/sdd/010-whatsapp-adapter.md).
 */

/** Valid Meta Cloud API webhook payload (1 inbound text message). */
export function inboundWebhookPayload(): object {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "waba-1",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551234567",
                phone_number_id: "987654321",
              },
              contacts: [{ profile: { name: "Cliente" } }],
              messages: [
                {
                  from: "549110001122",
                  id: "wamid.abc123",
                  timestamp: "1723000000",
                  type: "text",
                  text: { body: "Hola, ¿cuándo vence?" },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

/**
 * Empty-message webhook payload (exercises the full verify/parse/ingest path
 * without persisting rows) - the recommended shape for load tests.
 */
export function heartbeatWebhookPayload(): object {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "waba-1",
        changes: [
          { field: "messages", value: { messaging_product: "whatsapp" } },
        ],
      },
    ],
  };
}

export function connectionPayload(): object {
  return {
    waba_id: "waba-loadtest",
    phone_number_id: "phone-loadtest",
    phone: "+15551234567",
  };
}

export function draftPayload(conversationId: string): object {
  return {
    conversation_id: conversationId,
    text: "Buen día: según la normativa vigente, el vencimiento es el 15.",
  };
}

export const webhookChallenge = {
  url: (baseUrl: string, verifyToken: string, challenge: string): string =>
    `${baseUrl}/api/whatsapp/webhook?hub_mode=subscribe&hub_verify_token=${verifyToken}&hub_challenge=${challenge}`,
  value: "challenge-1234567890",
};