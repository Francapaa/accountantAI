import { check } from "k6";
import { test } from "k6/test";

import { BASE_URL, APPROVE_DRAFT_ID, authHeaders } from "../lib/config";
import { jsonObject, request } from "../lib/http";
import { smoke } from "../lib/scenarios";

export const options = smoke({ iterations: 10, vus: 1 });

if (!APPROVE_DRAFT_ID) {
  test.abort(
    "APPROVE_DRAFT_ID is not set; skipping to avoid real WhatsApp sends."
  );
}

const AUTH = authHeaders();
const urlPrefix = `${BASE_URL}/api/whatsapp/drafts`;

export default function (): void {
  const res = request(
    "POST",
    `${urlPrefix}/${APPROVE_DRAFT_ID}/approve`,
    undefined,
    AUTH,
    200
  );
  const body = jsonObject(res);
  check(res, {
    "approve returns sent/message_id": () =>
      body.status === "sent" || typeof body.message_id === "string",
  });
}