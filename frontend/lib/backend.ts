import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/supabase/env";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

/**
 * Calls an authenticated backend endpoint from a Server Component / Server
 * Action, forwarding the Supabase session cookie so the backend can verify
 * the JWT on every request. `cache: "no-store"` ensures fresh auth per call.
 */
export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const authCookie = (await cookies()).get(AUTH_COOKIE_NAME);
  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (authCookie) {
    headers.set("Cookie", `${authCookie.name}=${authCookie.value}`);
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    throw new Error(`Backend error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}