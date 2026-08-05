-- 0008: document_chunks (vectorized chunks for RAG)

-- embedding dimension is 1536 (Google text-embedding-004 with
-- output_dimensionality=1536). pgvector indexes are limited to 2000
-- dimensions, so 1536 keeps the HNSW index valid and storage small.

create table if not exists public.document_chunks (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references public.documents (id) on delete cascade,
  chunk_index     integer not null,
  content         text not null,
  embedding       vector(1536),
  embedding_model text not null,
  chunk_hash      text,
  created_at      timestamptz not null default now(),
  unique (document_id, chunk_index)
);