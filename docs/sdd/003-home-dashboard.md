# 003 — Home / Dashboard

> Status: Accepted · Last updated: 2026-08-04 · Owner: frontend

## Purpose

The authenticated accountant's landing page: a clear overview of their clients and quick
navigation into each client's workspace (chat). It is the "command center" of the tool.

## Scope

**In scope:**
- Client list (searchable) scoped to the current accountant.
- Quick actions: new client, open client chat.
- Navigation/sidebar layout shell shared across the app.

**Out of scope:**
- Client detail editing (see [004-clients](./004-clients.md)).
- Chat itself (see [005-chat-conversation](./005-chat-conversation.md)).
- Analytics/dashboard charts — future.

## Technical Decisions

| Decision | Choice |
|---|---|
| Rendering | **SSR page** (`page.tsx` without `'use client'`) |
| Data fetching | Server-side query of `clients` (by owner) |
| Shared layout | Root layout with Sidebar from `lib/components/` |
| Client rows | Client-side list component for search/filtering |
| Architecture | Scream architecture: `app/home/` owns its components + actions |

## Frontend Structure (Scream Architecture)

```
frontend/app/
├── layout.tsx               # app shell: sidebar + auth guard
├── home/
│   ├── page.tsx             # SSR, fetches clients (server)
│   ├── actions.ts           # server actions (createClient, etc.)
│   └── components/
│       ├── ClientList.tsx   # 'use client' (search/filter)
│       ├── ClientRow.tsx
│       ├── NewClientModal.tsx
│       └── index.ts
└── (shared) lib/components/ui/   # Button, Input, Card, Modal
```

The sidebar lists the current accountant's name and top-level navigation (Home, Clients,
Settings placeholder).

## API / Server Actions

- `GET /api/clients` (server-side) → list of clients for the current accountant.
- Server action `createClient(input)` → create a new client workspace → redirect to it.
- Server action `getClients()` used inside `page.tsx`.

> Endpoint details for `clients` CRUD are defined in [004-clients](./004-clients.md); this page
> **reads** that data.

## Workflows

**Given** an authenticated accountant, **when** they visit `/`, **then** they see a searchable
list of **their** clients.

**Given** the accountant, **when** they create a new client, **then** a client workspace is
created and they navigate to it.

**Given** the accountant, **when** they click an existing client, **then** they navigate to the
client's chat workspace.

**Given** the accountant, **when** they search the list, **then** the rows filter live by name.

**Given** a user is not signed in, **when** they visit `/`, **then** they are redirected to
sign-in (see [002](./002-login-auth.md)).

## Acceptance Criteria

1. `/` (home) requires authentication and shows only the current accountant's clients.
2. The client list is searchable by name without full reload.
3. Creating a client navigates to the new client workspace.
4. Clicking a client navigates to its chat.
5. The shared shell (sidebar) is consistent across home and client pages.
6. Scream architecture followed: SSR `page.tsx`, page-scoped `components/`, `actions.ts`.

## Open Questions

- Should the home page show recent activity or per-client summaries in the MVP? → Not in MVP; listed under Phase 2.
- Sorting options (alphabetical, last activity) — TBD defaults alphabetical.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Home/dashboard spec created. |