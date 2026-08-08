import { check } from "k6";
import { sleep } from "k6";

import { BASE_URL, CONVERSATION_ID, authHeaders } from "../lib/config";
import { draftPayload } from "../lib/fixtures";
import { jsonObject, request } from "../lib/http";
import { smoke } from "../lib/scenarios";

export const options = smoke({ iterations: 20, vus: 1 });

const AUTH = authHeaders();
const url = `${BASE_URL}/api/whatsapp/drafts`;

export default function (): void {
  // The happy path (201) requires an anchor conversation owned by SUB_USER_ID.
  const res = request(
    "POST",
    url,
    draftPayload(CONVERSATION_ID),
    AUTH,
    CONVERSATION_ID ? 201 : 404
  );
  const body = jsonObject(res);
  check(res, {
    "draft result has status field": () =>
      typeof body.status === "string" || body.detail !== undefined,
  });
  sleep(1);
}