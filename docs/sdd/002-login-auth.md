# 002 — Login & Auth

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend + frontend (auth)

## Purpose

Authenticate accountants and guarantee that every accountant only ever sees **their own**
clients, conversations, and messages. The normativa knowledge base is shared read-only.

## Scope

**In scope:**
- Sign up, sign in, sign out, password recovery.
- Session / cookie management.
- `profiles` record per user.
- Row-Level Security (RLS) baseline (detailed policies in [009](./009-database-schema.md)).
- Frontend auth pages built with scream architecture.

**Out of scope:**
- Roles beyond "accountant" (e.g. admins) — future.
- Third-party identity providers — future.
- Internal notes (Phase 2).

## Technical Decisions

| Decision | Choice |
|---|---|
| Provider | **Supabase Auth** |
| Strategy | Email + password |
| Session transport | Supabase cookie-based session for Next.js |
| Data scoping | RLS policies using `auth.uid()` vs `profile.owner_id` |
| Frontend layouts | Scream architecture; `app/auth/sign-in`, `app/auth/sign-up`, `app/auth/forgot-password` |
| Server actions | Per-page `actions.ts`, never `'use client'` in `page.tsx` |

## Data Model

- `profiles` table (detail in [009](./009-database-schema.md)):
  - `id uuid` — primary key, references `auth.users.id`.
  - `name text`
  - `email text` (unique)
  - `created_at timestamptz`

Every tenant-owned table carries `owner_id` (the `profiles.id` of the accountant who created
it) so RLS can scope rows.

## Frontend Structure (Scream Architecture)

```
frontend/app/auth/
├── sign-in/
│   ├── page.tsx            # SSR, no 'use client'
│   ├── actions.ts          # server action: signIn
│   └── components/
│       ├── SignInForm.tsx  # 'use client' (useActionState)
│       └── index.ts
├── sign-up/
│   ├── page.tsx
│   ├── actions.ts          # server action: signUp (create auth user + profile)
│   └── components/
├── forgot-password/
│   ├── page.tsx
│   ├── actions.ts
│   └── components/
└── callback/
    └── route.ts            # Supabase auth callback (PKCE)
```

Reusable UI (buttons, inputs, cards) lives in `lib/components/ui/`.

## API / Server Actions

- `signIn(email, password)` → sets session → redirect `/`.
- `signUp(email, password, name)` → create auth user + insert `profiles` row → redirect to sign-in.
- `signOut()` → clears session → redirect `/auth/sign-in`.
- `resetPassword(email)` → sends recovery email.
- `getSession()` / `requireAuth()` → guarded server utility used by restricted pages.

**Security rule:** never expose Supabase service key to the client. Use anon key + RLS and a
backend-only service role for privileged operations (e.g. ingestion).

## Workflows

**Given** a visitor is not signed in, **when** they visit `/`, **then** they are redirected to `/auth/sign-in`.

**Given** an accountant with email + password, **when** they submit `signIn`, **then** a session
is created, a `profiles` row exists, and they land on `/`.

**Given** new email/password/name, **when** they submit `signUp`, **then** an auth user and a
`profiles` row are created.

**Given** an authenticated accountant, **when** they sign out, **then** the session is cleared
and they return to `/auth/sign-in`.

**Given** any SQL query on tenant-owned tables, **when** RLS is enabled, **then** the backend
only returns rows where `owner_id = auth.uid()`.

## Acceptance Criteria

1. A user can sign up, sign in, sign out, and reset their password.
2. Sign-up creates both the auth user and a `profiles` row.
3. Sign-in persists the session across page reloads.
4. Restricted pages redirect unauthenticated users to sign-in.
5. RLS prevents an accountant from querying another accountant's clients/messages.
6. Auth pages follow scream architecture (SSR pages, `actions.ts`, `components/`).

## Open Questions

- Do accountants belong to an account/studio entity (org) with multiple members? → MVP assumes one-accountant-per-login; orgs are a future concern.
- Email verification on sign-up required for MVP? → TBD; default off for fast onboarding.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Auth spec created: Supabase Auth, multi-accountant, RLS baseline, scream-architecture pages. |