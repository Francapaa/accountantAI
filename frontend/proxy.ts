import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { assertEnv, AUTH_COOKIE_NAME } from "@/lib/supabase/env";

/**
 * Proxy (Next.js renamed middleware → proxy): refreshes the Supabase session
 * cookie on every matching request and guards routes.
 *
 * - Not authenticated + /home → redirect /auth/sign-in
 * - Authenticated + /auth/* → redirect /home
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey } = assertEnv();
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: { name: AUTH_COOKIE_NAME },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Trigger a refresh of an expired token and validate it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthed = Boolean(user);
  const { pathname } = request.nextUrl;

  if (!isAuthed && pathname.startsWith("/home")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  if (isAuthed && pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/auth/:path*", "/home/:path*"],
};
