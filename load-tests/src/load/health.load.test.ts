import http from "k6/http";
import { check } from "k6";

import { BASE_URL } from "../lib/config";
import { load } from "../lib/scenarios";

export const options = load();

export default function (): void {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { "GET /health -> 200": (r) => r.status === 200 });
}