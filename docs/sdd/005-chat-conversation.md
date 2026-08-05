# 005 — Chat & Conversation

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend + frontend

## Purpose

Provide the per-client chat where an accountant asks legal/tax questions and receives **cited**
answers backed by ARCA/AFIP normativa. Conversations are persisted per client (history) and
display along with the client's context.

## Scope

**In scope:**
- Conversations and messages persistence.
- Send a message → RAG answer (via [006](./006-rag-pipeline.md)).
- Citations UI (title + link to source URL).
- Conversation history view.
- Client context shown in the chat.

**Out of scope:**
- Semantic search over history (Phase 2).
- Auto monthly summaries (Phase 2).
- WhatsApp (Phase 3).

## Technical Decisions

| Decision | Choice |
|---|---|
| Persistence | `conversations` + `messages` tables (owner/cilent scoped) |
| Streaming | MVP returns a full response; streaming is a future enhancement |
| Citations | Stored as JSON on the assistant message; rendered as links |
| Chat route | Scream architecture: `app/clients/[id]/chat/` |
| Data flow | Frontend calls backend `POST /api/chat`; backend does RAG and persists |

## Data Model

- `conversations`: `id` pk, `client_id` fk, `title`, `created_at`, `updated_at`.
- `messages`: `id` pk, `conversation_id` fk, `role` (`user` | `assistant`), `content` text,
  `citations jsonb` (assistant only), `created_at`.

> Citations shape (document_id + quoted excerpt + title + source_url). Detailed DDL in
> [009](./009-database-schema.md).

## Frontend Structure (Scream Architecture)

```
frontend/app/clients/[id]/chat/
├── page.tsx            # SSR; loads conversation history (server)
├── actions.ts          # sendMessage (calls backend /api/chat + persists)
├── components/
│   ├── ChatWindow.tsx  # 'use client'; message list + input
│   ├── MessageBubble.tsx
│   ├── CitationList.tsx   # renders citations as links
│   ├── ClientContextCard.tsx
│   └── index.ts
```

Reusable UI (input, button, avatar, card) lives in `lib/components/ui/`.

## API / Server Actions

- `POST /api/chat` — body `{ client_id, conversation_id?, message }`.
  - Loads client context.
  - Runs RAG (embed → search → Gemini → citations) per [006](./006-rag-pipeline.md).
  - Upserts conversation + user/assistant messages (assistant carries `citations`).
  - Response: `{ conversation_id, reply, citations }`.
- `GET /api/clients/{client_id}/conversations` — list conversations.
- `GET /api/conversations/{id}/messages` — message history.

Server action `sendMessage(...)` mirrors `POST /api/chat`.

## Workflows

**Given** the accountant opens a client chat, **when** the page loads, **then** the conversation
history and client context card are shown.

**Given** the accountant types a question, **when** they send it, **then** the backend returns a
cited answer; the user message and assistant message (with citations) are persisted.

**Given** the answer contains citations, **when** it is rendered, **then** each citation shows the
document title and links to the source URL.

**Given** the accountant reopens the chat later, **when** the conversation exists, **then** prior
messages are loaded (history).

**Given** no conversation exists yet, **when** the accountant sends the first message, **then** a
new conversation is created automatically.

## Acceptance Criteria

1. A client can have one or more conversations; messages are appended in order.
2. Sending a message persists both user and assistant messages with citations JSON.
3. Citations are rendered as title + clickable source URL.
4. Conversation history reloads on page load.
5. First message auto-creates a conversation.
6. RLS restricts chats/messages to the owning accountant and client.
7. Chat page follows scream architecture.

## Open Questions

- Should reply be streamed token-by-token in MVP? → No; future enhancement.
- Max message history/context window per request — TBD; MVP uses recent N messages + client context.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Chat/conversation spec created. |