import { check } from "k6";

import { BASE_URL, authHeaders } from "../lib/config";
import { jsonObject, request } from "../lib/http";
import { smoke } from "../lib/scenarios";

export const options = smoke({ iterations: 25 });

export default function (): void {
  const res = request("GET", `${BASE_URL}/api/me`, undefined, authHeaders(), 200);
  check(res, {
    "me returns a user id": () => typeof jsonObject(res).id === "string",
  });
}