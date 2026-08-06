-- 0011: vector similarity search function (RAG retrieval)

-- Search chunks by cosine similarity. SECURITY DEFINER so authenticated users
-- can run it without exposing the raw chunks table; RLS still applies because
-- the function reads through the security invoker's view (document_chunks has
-- a SELECT policy for authenticated roles). filter is a reserved param name
-- in postgrest, so it is named match_filter.

create or replace function public.match_documents(
  query_embedding vector(1536),
  match_count integer default 5,
  match_filter jsonb default '{}'
) returns table (
  document_id   uuid,
  title         text,
  document_type public.document_type,
  source_url    text,
  content       text,
  chunk_index   integer,
  similarity    real
)
language plpgsql
security invoker
as $$
begin
  return query
    select
      c.document_id,
      d.title,
      d.document_type,
      d.source_url,
      c.content,
      c.chunk_index,
      1 - (c.embedding <=> query_embedding) as similarity
    from public.document_chunks c
    join public.documents d on d.id = c.document_id
    where c.embedding_model = coalesce(match_filter->>'embedding_model', c.embedding_model)
      and d.is_active = true
    order by c.embedding <=> query_embedding
    limit match_count;
end;
$$;

grant execute on function public.match_documents(vector(1536), integer, jsonb)
  to authenticated, service_role;
