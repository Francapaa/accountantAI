import { cache } from "react";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Client = {
  id: string;
  owner_id: string;
  name: string;
  province: string | null;
  tax_regime: string | null;
  activity: string | null;
  notes_public: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Lists the current accountant's clients (RLS-scoped), ordered by name.
 * Wrapped in React `cache()` so the layout (drawer) and the home page (grid)
 * share a single query per request.
 */
export const getClients = cache(async (): Promise<Client[]> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Client[];
});
