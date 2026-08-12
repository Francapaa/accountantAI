import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { assertEnv, AUTH_COOKIE_NAME } from "./env";

/**
 * Server-side Supabase client (anon key + RLS) with cookie-based sessions.
 * Use inside Server Components and Server Actions. RLS scopes the data.
 * Wrapped in React `cache()` so props/actions within the same request share
 * a single client (one HTTP keep-alive session instead of one per call).
 */
export const getSupabaseServerClient = cache((): SupabaseClient => {
  const { url, anonKey } = assertEnv();

  return createServerClient(url, anonKey, {
    cookieOptions: { name: AUTH_COOKIE_NAME },
    cookies: {
      getAll() {
        return cookies().then((c) => c.getAll());
      },
      setAll(cookiesToSet) {
        try {
          cookies().then((c) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              c.set(name, value, options);
            });
          });
        } catch {
          // Called from a Server Component; the proxy (proxy.ts) writes cookies.
        }
      },
    },
  });
});