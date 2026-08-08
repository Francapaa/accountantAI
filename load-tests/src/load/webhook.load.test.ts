import { check } from "k6";
import http from "k6/http";

import { BASE_URL, whatsappAppSecret, whatsappVerifyToken } from "../lib/config";
import { heartbeatWebhookPayload, webhookChallenge } from "../lib/fixtures";
import { request, signatureFor } from "../lib/http";
import { load } from "../lib/scenarios";

export const options = load();

const VERIFY_TOKEN = whatsappVerifyToken();
const APP_SECRET = whatsappAppSecret();
const url = `${BASE_URL}/api/whatsapp/webhook`;

export default function (): void {
  request(
    "GET",
    webhookChallenge.url(url, VERIFY_TOKEN, "challenge-load"),
    undefined,
    {},
    200
  );

  // Heartbeat payload keeps the load test write-free while still exercising
  // HMAC verification, body parsing and the (empty) ingest path.
  const raw = JSON.stringify(heartbeatWebhookPayload());
  const res = http.post(url, raw, {
    headers: { "X-Hub-Signature-256": signatureFor(raw, APP_SECRET) },
  });
  check(res, { "webhook heartbeat POST -> 200": (r) => r.status === 200 });
}