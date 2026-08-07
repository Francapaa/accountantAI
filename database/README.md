# Supabase — Database Migrations

SQL migrations for the AccountantAI schema. They follow the specification in
[`docs/sdd/009-database-schema.md`](../docs/sdd/009-database-schema.md).

## How to apply (SQL Editor)

1. Go to your Supabase project → **SQL Editor** → **New query**.
2. Paste the files **in order** (`0001` → `0010`), one at a time, and run each.
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
| `0010_storage.sql` | `documents.storage_path` column + private `normativa` Storage bucket |
| `0011_match_documents.sql` | `match_documents` vector search function (RAG retrieval) |
| `0012_whatsapp.sql` | `whatsapp_connections` + `clients.phone` + WhatsApp transport fields on `messages` |

## Notes

- `embedding` is `vector(1536)`. The embedding model (Google `gemini-embedding-2`) is called with
  `output_dimensionality=1536`. pgvector indexes are limited to **2000 dimensions**, so 1536 keeps
  the HNSW index valid while reducing storage (see `docs/sdd/001-architecture.md`).
- Raw normativa sources are stored in the **private** `normativa` Storage bucket (`documents.storage_path`),
  created in `0010`. Objects are only reachable by the backend service role (ingestion).
- The normativa corpus (`documents`, `document_chunks`) is **read-only** for end users.
  Writes are done by the backend service role, which bypasses RLS.
- The `profiles` row is created automatically by a trigger when a user signs up via
  Supabase Auth.
