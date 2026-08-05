import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { assertEnv, AUTH_COOKIE_NAME } from "./env";

/**
 * Browser/client Supabase client (anon key + RLS) with cookie-based sessions.
 * Lazily created so the app can boot without Supabase configured.
 */
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { url, anonKey } = assertEnv();
    browserClient = createBrowserClient(url, anonKey, {
      cookieOptions: { name: AUTH_COOKIE_NAME },
    });
  }
  return browserClient;
}