# 009 — Database Schema & RLS

> Status: Accepted · Last updated: 2026-08-04 · Owner: backend (Supabase)

## Purpose

Define the single source of truth for the PostgreSQL / pgvector schema, indexes, and Row-Level
Security policies. This is the canonical DDL that migrations in `supabase/` implement.

## Conventions

- All timestamps: `timestamptz` (UTC).
- Pkeys: `uuid` default `gen_random_uuid()`.
- Tenant tables carry `owner_id uuid` → `profiles.id` for RLS.
- Normativa tables are **read-only for all authenticated accountants** (shared corpus).
- FK deletes: clients → conversations → messages use cascade.

## Tables

### 1. `profiles`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | `references auth.users(id)` |
| name | text | |
| email | text unique not null | |
| created_at | timestamptz | default now() |

### 2. `clients`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| owner_id | uuid not null | RLS scope → profiles.id |
| name | text not null | |
| province | text | persistent context |
| tax_regime | text | e.g. Monotributo |
| activity | text | rubro/industry |
| notes_public | text | AI-usable context |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 3. `conversations`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| client_id | uuid not null fk → clients(id) on delete cascade | |
| owner_id | uuid not null | RLS scope (denormalized) |
| title | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 4. `messages`

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| conversation_id | uuid fk → conversations(id) on delete cascade | |
| role | text | `user` \| `assistant` |
| content | text not null | |
| citations | jsonb | assistant only; `[]` otherwise |
| created_at | timestamptz | |

Citations shape: `[{ document_id, title, document_type, source_url, quoted_excerpt, chunk_index }]`.

### 5. `documents`  (shared normativa corpus)

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| source_url | text unique not null | upsert key |
| storage_path | text | object in the `normativa` Storage bucket (raw PDF/HTML) |
| title | text not null | |
| document_type | enum | `FAQ, Resolución, Manual, Ley, Instructivo` |
| publication_date | date | |
| content_hash | text | SHA-256 of raw download (cron check) |
| status | enum | `scraped, failed` |
| is_active | boolean default true | tombstone for 404 |
| is_manual | boolean default false | manual-upload fallback |
| crawled_at | timestamptz | last checked |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 6. `document_chunks`  (vectorized)

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| document_id | uuid fk → documents(id) on delete cascade | |
| chunk_index | int not null | |
| content | text not null | |
| embedding | vector(1536) | Google text-embedding-004 with output_dimensionality=1536 (indexes are limited to 2000 dims) |
| embedding_model | text not null | active version gate |
| chunk_hash | text | |
| created_at | timestamptz | |

Constraints: `UNIQUE (document_id, chunk_index)`.

## Enums

```sql
create type document_type as enum ('FAQ','Resolución','Manual','Ley','Instructivo');
create type doc_status as enum ('scraped','failed');
```

## Indexes

```sql
-- vector similarity
create index document_chunks_embedding_hnsw_idx
  on document_chunks using hnsw (embedding vector_cosine_ops);

-- active + model filter for retrieval
create index document_chunks_active_model_idx
  on document_chunks (embedding_model, document_id)
  where document_id in (select id from documents where is_active);

-- lookup keys
create unique index documents_source_url_idx on documents (source_url);
create index conversations_client_idx on conversations (client_id);
create index messages_conversation_idx on messages (conversation_id);
create index clients_owner_idx on clients (owner_id);
```

> Optional IVFFlat alternative: `ivfflat (embedding vector_cosine_ops) with (lists = 100)` for
> smaller corpora. HNSW is preferred for recall + no build-time tuning.

## Row-Level Security (RLS)

```sql
-- profiles: own row only
alter table profiles enable row level security;
create policy profiles_self on profiles
  using (id = auth.uid())
  with check (id = auth.uid());

-- clients / conversations / messages: owner only
create policy clients_owner on clients
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy conversations_owner on conversations
  using (owner_id = auth.uid());

create policy messages_owner on messages
  using (conversation_id in (
    select id from conversations where owner_id = auth.uid()
  ));

-- normativa: shared, read-only for authenticated users
alter table documents enable row level security;
alter table document_chunks enable row level security;
create policy documents_read on documents
  for select using (auth.role() = 'authenticated');
create policy document_chunks_read on document_chunks
  for select using (auth.role() = 'authenticated');
```

> Insert into `documents`/`document_chunks` is done by the **backend service role** (ingestion),
> not by end users.

## Storage (raw files)

A single **private** Supabase Storage bucket `normativa` holds every raw source (PDF/HTML)
downloaded by the scraper. Objects are only reachable by the **backend service role** (ingestion
and chunking). Each document in `documents` references its raw file via `storage_path`. The bucket
is created in migration `0010_storage.sql` together with the `storage_path` column.

## Retrieval Query

```sql
select c.document_id, d.title, d.document_type, d.source_url, c.content, c.chunk_index,
       1 - (c.embedding <=> :query_vector) as similarity
from document_chunks c
join documents d on d.id = c.document_id
where c.embedding_model = :active_model
  and d.is_active = true
order by c.embedding <=> :query_vector
limit :k;
```

## Workflows

**Given** an authenticated accountant, **when** they query clients/conversations/messages,
**then** RLS returns only their own rows.

**Given** an authenticated accountant, **when** they query `documents`/`document_chunks`,
**then** they can read the shared normativa corpus but not write to it.

**Given** a client is deleted, **when** cascades apply, **then** its conversations and messages
are deleted.

**Given** a document is re-indexed, **when** chunks are refreshed, **then** `document_id +
chunk_index` uniqueness prevents duplicates.

## Acceptance Criteria

1. All DDL above is implemented in `supabase/` migrations.
2. RLS is enabled on every tenant table and blocks cross-accountant access.
3. Normativa tables are readable by any authenticated user and write-protected.
4. The vector index supports efficient cosine similarity search.
5. Retrieval filters by active model and active documents.
6. Unique `(document_id, chunk_index)` and unique `source_url` hold.

## Open Questions

- `vector(1536)` — configured via Google `output_dimensionality=1536` because pgvector indexes
  support at most 2000 dimensions.
- Whether `conversations.owner_id` should be derived vs stored — stored for query efficiency (denormalized), kept in sync by the app.

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Full schema + indexes + RLS spec created. |
| 2026-08-05 | Embedding dimension changed to 1536 (`output_dimensionality=1536`) because pgvector indexes are limited to 2000 dimensions. Migrations validated against Postgres + pgvector. |
| 2026-08-05 | Added `documents.storage_path` and the private `normativa` Storage bucket for raw PDF/HTML sources. |