import { check } from "k6";
import { sleep } from "k6";

import { BASE_URL, authHeaders } from "../lib/config";
import { connectionPayload } from "../lib/fixtures";
import { jsonObject, request } from "../lib/http";
import { smoke } from "../lib/scenarios";

export const options = smoke({ iterations: 20, vus: 1 });

const AUTH = authHeaders();
const url = `${BASE_URL}/api/whatsapp/connections`;

export default function (): void {
  request("GET", url, undefined, AUTH, 200);

  const created = request("POST", url, connectionPayload(), AUTH, 201);
  const id = jsonObject(created).id;
  check(created, {
    "connection has an id": () => typeof id === "string",
  });

  if (typeof id === "string") {
    request("DELETE", `${url}/${id}`, undefined, AUTH, 200);
  }

  sleep(2);
}