import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated user (server-side) or null.
 * Uses getUser() to validate the token against Supabase, not just local state.
 * Returns null when Supabase is not configured so the app can boot / prerender.
 */
export async function getUser(): Promise<User | null> {
  try {
    const supabase = getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Redirects to sign-in if there is no authenticated session.
 * Returns the user when authenticated.
 */
export async function requireAuth<UserType = User>(): Promise<UserType> {
  const user = await getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  return user as UserType;
}

/**
 * Redirects authenticated users away from guest pages (sign-in/sign-up/...).
 * Call at the top of guest pages when a signed-in user should be sent home.
 */
export async function redirectIfAuthed(home = "/home"): Promise<User | null> {
  const user = await getUser();
  if (user) {
    redirect(home);
  }
  return user;
}