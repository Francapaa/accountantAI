import { signJwt } from "./jwt";

export type Headers = Record<string, string>;

/** Reads a k6 env var with a fallback. */
export function env(name: string, fallback: string): string {
  const value = __ENV[name];
  return value === undefined || value === "" ? fallback : value;
}

/** Number env helper with a fallback. */
export function envNum(name: string, fallback: number): number {
  const value = parseInt(env(name, String(fallback)), 10);
  return Number.isFinite(value) ? value : fallback;
}

export const BASE_URL = env("BASE_URL", "http://127.0.0.1:8000");

export const SUPABASE_JWT_SECRET = env("SUPABASE_JWT_SECRET", "");
export const SUB_USER_ID = env(
  "SUB_USER_ID",
  "00000000-0000-0000-0000-000000000001"
);

export const CONVERSATION_ID = env("CONVERSATION_ID", "");
export const CONNECTION_ID = env("CONNECTION_ID", "");
export const APPROVE_DRAFT_ID = env("APPROVE_DRAFT_ID", "");

export function whatsappVerifyToken(): string {
  return env("WHATSAPP_VERIFY_TOKEN", "");
}
export function whatsappAppSecret(): string {
  return env("WHATSAPP_APP_SECRET", "");
}

export function authHeaders(): Headers {
  return {
    Authorization: `Bearer ${signJwt(SUB_USER_ID, SUPABASE_JWT_SECRET)}`,
    "Content-Type": "application/json",
  };
}