import { check } from "k6";

import { BASE_URL, authHeaders } from "../lib/config";
import { jsonObject, request } from "../lib/http";
import { load } from "../lib/scenarios";

export const options = load();

const AUTH = authHeaders();

export default function (): void {
  const res = request(
    "GET",
    `${BASE_URL}/api/whatsapp/connections`,
    undefined,
    AUTH,
    200
  );
  check(res, {
    "connections list is an array": () =>
      Array.isArray(jsonObject(res).connections),
  });
}