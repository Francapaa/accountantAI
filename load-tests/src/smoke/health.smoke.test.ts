import http from "k6/http";
import { check } from "k6";

import { BASE_URL } from "../lib/config";
import { jsonObject } from "../lib/http";
import { smoke } from "../lib/scenarios";

export const options = smoke({ iterations: 25 });

export default function (): void {
  for (const path of ["/", "/health"]) {
    const res = http.get(`${BASE_URL}${path}`);
    const body = jsonObject(res);
    check(res, {
      [`GET ${path} -> 200`]: (r) => r.status === 200,
      "body is json": (_r) =>
        body.status === "ok" || body.message !== undefined,
    });
  }
}