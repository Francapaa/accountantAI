# Supabase — Database Migrations

SQL migrations for the AccountantAI schema. They follow the specification in
[`docs/sdd/009-database-schema.md`](../docs/sdd/009-database-schema.md).

## How to apply (SQL Editor)

1. Go to your Supabase project → **SQL Editor** → **New query**.
2. Paste the files **in order** (`0001` → `0009`), one at a time, and run each.
3. Or paste the content of all files combined into a single query.

The migrations are **idempotent**: re-running them is safe (`IF NOT EXISTS`,
`DROP ... IF EXISTS`).

## Files

| File | Contents |
|------|----------|
| `0001_enable_extensions.sql` | Enable `pgvector` extension |
| `0002_enums.sql` | `document_type`, `doc_status` enums |
| `0003_profiles.sql` | `profiles` table + auto-create on sign-up trigger |
| `0004_clients.sql` | `clients` table (workspace + persistent context) |
| `0005_conversations.sql` | `conversations` table |
| `0006_messages.sql` | `messages` table (with `citations` jsonb) |
| `0007_documents.sql` | `documents` table (normativa corpus) |
| `0008_document_chunks.sql` | `document_chunks` table (vectorized chunks) |
| `0009_indexes_rls.sql` | Indexes (HNSW) + Row-Level Security policies + grants |

## Notes

- `embedding` is `vector(1536)`. The embedding model (Google `text-embedding-004`) is called with
  `output_dimensionality=1536`. pgvector indexes are limited to **2000 dimensions**, so 1536 keeps
  the HNSW index valid while reducing storage (see `docs/sdd/001-architecture.md`).
- The normativa corpus (`documents`, `document_chunks`) is **read-only** for end users.
  Writes are done by the backend service role, which bypasses RLS.
- The `profiles` row is created automatically by a trigger when a user signs up via
  Supabase Auth.
