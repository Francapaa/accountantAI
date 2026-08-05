# 004 — Clients (Workspaces & Persistent Context)

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend + frontend

## Purpose

Represent each client as a **workspace** (a folder) that owns its conversations and carries a
**persistent profile context** the AI uses when answering. This context lets the assistant
remember that a client is a monotributista, the province they operate in, their activity/rubro, etc.

## Scope

**In scope:**
- Client entity + CRUD.
- Persistent profile fields used as RAG context.
- Client page (scream architecture) showing profile + entry into chat.
- RLS scoping by owner.

**Out of scope:**
- Internal notes (Phase 2).
- Semantic search over history (Phase 2).
- Monthly summaries (Phase 2).

## Technical Decisions

| Decision | Choice |
|---|---|
| Owner scoping | `owner_id` + RLS |
| Context storage | Structured columns on `clients` (serves as the client "memory") |
| Context usage | Loaded on each chat request and injected into the prompt (see [006](./006-rag-pipeline.md)) |
| Client page | Scream architecture: `app/clients/[id]/` |

## Data Model

`clients` (detail DDL in [009](./009-database-schema.md)):
- `id uuid` pk
- `owner_id uuid` → `profiles.id` (RLS scope)
- `name text`
- `province text`
- `tax_regime text` — e.g. "Monotributo", "Responsable Inscripto"
- `activity text` — rubro / industry
- `notes_public text` — free-form context visible & usable by AI
- `created_at / updated_at timestamptz`

> These context fields are the **persistent memory** the AI reads. They answer questions like
> "is this client a monotributista" and "what province are they in".

## Frontend Structure (Scream Architecture)

```
frontend/app/clients/
├── new/
│   ├── page.tsx
│   ├── actions.ts         # createClient
│   └── components/ (ClientForm)
└── [id]/
    ├── page.tsx           # SSR; loads client profile + conversations
    ├── actions.ts         # updateClient, deleteClient
    ├── layout.tsx         # client header (name, regime, province)
    └── components/
        ├── ClientProfile.tsx
        ├── EditProfileForm.tsx
        └── index.ts
```

The chat itself lives under `app/clients/[id]/chat` (see [005](./005-chat-conversation.md)).

## API / Server Actions

- `POST /api/clients` → create (body: name, province, tax_regime, activity).
- `GET /api/clients` → list (owner-scoped), used by home.
- `GET /api/clients/{id}` → single (owner-scoped).
- `PUT /api/clients/{id}` → update profile/context.
- `DELETE /api/clients/{id}` → delete workspace (+ its conversations/messages by cascade).
- Server actions mirror these for form submissions.

All endpoints validate ownership through RLS; the backend never leaks another owner's rows.

## Workflows

**Given** an authenticated accountant, **when** they create a client with `tax_regime=Monotributo`
and `province=Buenos Aires`, **then** a workspace is created and the context is persisted.

**Given** a client exists, **when** the accountant edits the profile, **then** the context fields
are updated and used by future chat answers.

**Given** an accountant with clients, **when** they query `GET /api/clients`, **then** only their
own clients are returned.

**Given** a conversation question about a monotributista client, **when** the RAG builds the prompt,
**then** the client's persisted context is included so the answer matches their profile.

## Acceptance Criteria

1. Full CRUD for clients, scoped to the current accountant.
2. Persistent context fields (province, tax_regime, activity) are saved and editable.
3. Client context is loaded and injected into every chat request for that client.
4. Deleting a client removes its conversations/messages.
5. A client cannot be viewed or edited by another accountant (RLS enforced).
6. Client pages follow scream architecture.

## Open Questions

- Should context support free-form notes beyond the structured fields in the MVP? → Basic free-form `notes_public` included; richer internal notes are Phase 2.
- Should clients have tax-payer identifiers (CUIT) now or later? → TBD.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Clients/workspaces spec created with persistent context. |