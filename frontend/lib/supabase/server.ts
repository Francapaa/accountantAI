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
 * Server-side Supabase client (anon key + RLS).
 * Use inside Server Components and Server Actions. RLS scopes the data.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const { url, anonKey } = assertEnv();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}