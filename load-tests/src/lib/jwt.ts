import crypto from "k6/crypto";
import encoding from "k6/encoding";

function base64url(input: string): string {
  return encoding.b64encode(input, "rawurl");
}

/**
 * Signs a Supabase-compatible JWT (HS256) entirely inside the k6 runtime.
 *
 * The backend validates it with PyJWT against `SUPABASE_JWT_SECRET`, requires
 * the `sub` and `exp` claims and the `authenticated` audience
 * (backend/app/api/auth.py). No network call is needed to obtain the token.
 */
export function signJwt(sub: string, secret: string, ttlSeconds = 3600): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({
      sub,
      aud: "authenticated",
      iat: now,
      exp: now + ttlSeconds,
      role: "authenticated",
    })
  );
  const signingInput = `${header}.${payload}`;
  const signature = crypto.hmac("sha256", secret, signingInput, "base64rawurl");
  return `${signingInput}.${signature}`;
}