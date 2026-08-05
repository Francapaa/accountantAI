-- 0002: Enums
-- document_type: type of a normativa document
-- doc_status: ingestion status of a document

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_type') then
    create type public.document_type as enum ('FAQ', 'Resolución', 'Manual', 'Ley', 'Instructivo');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'doc_status') then
    create type public.doc_status as enum ('scraped', 'failed');
  end if;
end $$;