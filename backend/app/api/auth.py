"""Auth helpers: verifies Supabase JWTs on every protected request.

The frontend (Next.js + @supabase/ssr) stores the Supabase session in an
httpOnly cookie named `sb-access-token`. Its value is `base64-` + base64url(
JSON with `access_token`, `refresh_token`, `expires_at`). This module reads
that cookie (or an `Authorization: Bearer <jwt>` header), extracts the
access token (a JWT) and validates its signature/expiry with the project's
JWT secret (PyJWT). The `sub` claim is the Supabase user id (= auth.uid()).
"""

import base64
import binascii
import json
import re

import jwt
from fastapi import Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.core.config import settings

# @supabase/ssr prefixes base64-encoded session cookies with `base64-`.
_BASE64_PREFIX = "base64-"
_COOKIE_CHUNK_PATTERN = re.compile(r"^sb-access-token(\.\d+)?$")

_AUTH_COOKIE_NAME = "sb-access-token"


class CurrentUser(BaseModel):
    id: str
    email: str | None = None


def _extract_access_token(request: Request) -> str | None:
    """Pull the JWT from the Authorization header or the Supabase session cookie."""
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        token = auth_header[7:].strip()
        if token:
            return token

    # @supabase/ssr may split a large session across multiple cookies
    # (sb-access-token, sb-access-token.0, ...). Reassemble in order.
    chunks: dict[int, str] = {}
    for name, value in request.cookies.items():
        match = _COOKIE_CHUNK_PATTERN.match(name)
        if not match:
            continue
        index = int(match.group(1)) if match.group(1) else -1
        chunks[index] = value

    if not chunks:
        return None

    raw = "".join(chunks[i] for i in sorted(chunks))

    if raw.startswith(_BASE64_PREFIX):
        payload = raw[len(_BASE64_PREFIX) :]
        try:
            decoded = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
        except (binascii.Error, ValueError):
            return None
        try:
            session = json.loads(decoded)
        except json.JSONDecodeError:
            return None
        token = session.get("access_token")
        return token if isinstance(token, str) else None

    return None


def _verify_access_token(token: str) -> CurrentUser:
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend misconfigured: SUPABASE_JWT_SECRET is not set.",
        )

    try:
        claims = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={"require": ["sub", "exp"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado.",
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
        ) from exc

    return CurrentUser(id=claims["sub"], email=claims.get("email"))


def get_current_user(request: Request) -> CurrentUser:
    """FastAPI dependency: verifies the Supabase JWT and returns the user."""
    token = _extract_access_token(request)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autorizado: falta token de sesión.",
        )
    return _verify_access_token(token)


__all__ = ["CurrentUser", "get_current_user"]
