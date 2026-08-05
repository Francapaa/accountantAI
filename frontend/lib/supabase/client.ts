import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function assertEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    );
  }

  return { url, anonKey };
}

/**
 * Browser/client Supabase client (anon key + RLS).
 * Lazily created so the app can boot without Supabase configured.
 */
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { url, anonKey } = assertEnv();
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}