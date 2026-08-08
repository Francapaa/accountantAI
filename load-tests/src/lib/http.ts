import { check } from "k6";
import crypto from "k6/crypto";
import encoding from "k6/encoding";
import http, { type Response } from "k6/http";

import { BASE_URL } from "./config";

export type Headers = Record<string, string>;

/**
 * Issues a GET/POST/DELETE against `url` and records a check that the status
 * matches the expectation. Always returns the raw response so callers can log
 * or inspect bodies on failure.
 */
export function request(
  method: "GET" | "POST" | "DELETE",
  url: string,
  body: unknown,
  headers: Headers,
  expectedStatus = 200
): Response {
  const payload = typeof body === "string" ? body : JSON.stringify(body ?? {});
  let res: Response;
  if (method === "GET") {
    res = http.get(url, { headers });
  } else if (method === "DELETE") {
    res = http.del(url, null, { headers });
  } else {
    res = http.post(url, payload, { headers });
  }
  check(res, {
    [`${method} ${relUrl(url)} -> ${expectedStatus}`]: (r) =>
      r.status === expectedStatus,
  });
  return res;
}

/** HMAC-SHA256 signature in Meta's `X-Hub-Signature-256` format. */
export function signatureFor(rawBody: string, secret: string): string {
  const hex = crypto.hmac("sha256", secret, rawBody, "hex");
  return `sha256=${hex}`;
}

/** URL-safe base64 without padding (used for the webhook challenge). */
export function urlSafeEncode(value: string): string {
  return encoding.b64encode(value, "rawurl");
}

/** Response body as a plain object (casts k6's `JSONValue` result). */
export function jsonObject(res: Response): Record<string, unknown> {
  let value: unknown;
  try {
    value = res.json();
  } catch {
    return {};
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function relUrl(url: string): string {
  const base = url.replace(BASE_URL, "");
  return base.length === 0 ? "/" : base;
}