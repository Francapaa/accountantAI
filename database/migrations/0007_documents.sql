-- 0007: documents (normativa corpus metadata)

create table if not exists public.documents (
  id               uuid primary key default gen_random_uuid(),
  source_url       text not null unique,
  title            text not null,
  document_type    public.document_type not null default 'Manual',
  publication_date date,
  content_hash     text,
  status           public.doc_status not null default 'scraped',
  is_active        boolean not null default true,
  is_manual        boolean not null default false,
  crawled_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists set_updated_at_documents on public.documents;
create trigger set_updated_at_documents
  before update on public.documents
  for each row execute function public.set_updated_at();