# AccountantAI — Spec-Driven Development (SDD)

This folder is the **single source of truth** for the AccountantAI product. Every feature is
described in a spec that must be satisfied before the feature is considered done.

Purposes:
- Align engineering, product, and stakeholders on **what** we build and **why**.
- Define acceptance criteria so work is verifiable.
- Document decisions (technical, data model, API) so they are never lost.

## Map of documents

| #  | Doc                                                      | Scope                                                        |
|----|-----------------------------------------------------------|--------------------------------------------------------------|
| 0  | [README](./README.md)                                    | This index + SDD conventions + spec template                 |
| 1  | [001-architecture](./001-architecture.md)                | System architecture, stack, data flow, versioning            |
| 2  | [002-login-auth](./002-login-auth.md)                    | Supabase Auth, multi-accountant login, RLS, sessions         |
| 3  | [003-home-dashboard](./003-home-dashboard.md)            | Home screen: client list and quick navigation                |
| 4  | [004-clients](./004-clients.md)                          | Client workspaces and persistent profile context             |
| 5  | [005-chat-conversation](./005-chat-conversation.md)      | Per-client chat, history, citations UI                       |
| 6  | [006-rag-pipeline](./006-rag-pipeline.md)                | RAG: embed → semantic search → Gemini → cited answer         |
| 7  | [007-scraper](./007-scraper.md)                          | Crawl/download/parse/clean of ARCA/AFIP normativa            |
| 8  | [008-cron-sync](./008-cron-sync.md)                      | Nightly incremental sync with hash checks                    |
| 9  | [009-database-schema](./009-database-schema.md)          | Full PostgreSQL/pgvector schema + indexes + RLS policies     |
| 10 | [010-whatsapp-adapter](./010-whatsapp-adapter.md)        | WhatsApp transport: Meta Cloud API provider abstraction       |

## Roadmap

### Phase 1 — MVP (in scope)
- [RAG with legal citations](./006-rag-pipeline.md)
- [Per-client folder][004-clients.md]
- [Per-client chat with history](./005-chat-conversation.md)
- [Persistent client profile context](./004-clients.md)
- Multi-accountant auth with row-level security ([002](./002-login-auth.md), [009](./009-database-schema.md))
- [Normativa ingestion + nightly sync](./007-scraper.md, [008](./008-cron-sync.md))

### Phase 2 (out of scope for MVP)
- Semantic search over prior conversations ("what did we reply to Juan about X?")
- Automatic monthly summary of a client's queries
- Internal notes merged into RAG context

### Phase 3 (out of scope for MVP)
- WhatsApp integration ([010](./010-whatsapp-adapter.md))

## SDD conventions

1. **Truth lives in specs.** Code must satisfy the spec; spec beats implementation.
2. **English only.** All specs are written in English.
3. **Numbered documents.** Prefix with zero-padded numbers; files keep names in kebab-case.
4. **Changelog.** Every spec ends with a changelog; every change must be recorded with a date.
5. **If in doubt, update the spec.** Before changing behavior, update the spec first, then implement.

## Spec template

Every `XXX-*.md` document follows this structure (whenever a section does not apply, state it
explicitly rather than omitting it):

```
# Title
## Purpose
## Scope (in / out)
## Technical Decisions
## Data Model
## API
## Workflows (given / when / then)
## Acceptance Criteria
## Open Questions
## Changelog
```