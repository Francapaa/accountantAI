import { check } from "k6";
import http from "k6/http";
import { sleep } from "k6";

import {
  BASE_URL,
  whatsappAppSecret,
  whatsappVerifyToken,
} from "../lib/config";
import {
  heartbeatWebhookPayload,
  inboundWebhookPayload,
  webhookChallenge,
} from "../lib/fixtures";
import { jsonObject, request, signatureFor } from "../lib/http";
import { smoke } from "../lib/scenarios";

export const options = smoke({ iterations: 20, vus: 1 });

const VERIFY_TOKEN = whatsappVerifyToken();
const APP_SECRET = whatsappAppSecret();
const url = `${BASE_URL}/api/whatsapp/webhook`;

export default function (): void {
  const ok = request(
    "GET",
    webhookChallenge.url(url, VERIFY_TOKEN, webhookChallenge.value),
    undefined,
    {},
    200
  );
  check(ok, {
    "challenge echoed": () =>
      jsonObject(ok).challenge === webhookChallenge.value,
  });

  request(
    "GET",
    webhookChallenge.url(url, "WRONG-TOKEN", webhookChallenge.value),
    undefined,
    {},
    403
  );

  const rawInbound = JSON.stringify(inboundWebhookPayload());
  const inbound = http.post(url, rawInbound, {
    headers: { "X-Hub-Signature-256": signatureFor(rawInbound, APP_SECRET) },
  });
  check(inbound, { "webhook POST -> 200": (r) => r.status === 200 });

  // Heartbeat (no inbound messages) exercises verify + parse without writes.
  const rawHeartbeat = JSON.stringify(heartbeatWebhookPayload());
  const heartbeat = http.post(url, rawHeartbeat, {
    headers: { "X-Hub-Signature-256": signatureFor(rawHeartbeat, APP_SECRET) },
  });
  check(heartbeat, { "heartbeat POST -> 200": (r) => r.status === 200 });

  sleep(1);
}