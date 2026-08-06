-- 0010: storage_path column + private `normativa` Storage bucket
--
-- 0010_storage.sql — Agrega documents.storage_path y crea el bucket privado `normativa`
-- para persistir el raw (PDF/HTML) que descarga el scraper antes de parsear/chunkear.
--
-- The scraper (007) persists every raw source (PDF/HTML) as an object in
-- the private `normativa` bucket before parsing/chunking. Each document in
-- `documents` references its raw object via `storage_path`.
-- Objects are only reachable by the backend service role (ingestion).

alter table public.documents
  add column if not exists storage_path text;

insert into storage.buckets (id, name, public)
values ('normativa', 'normativa', false)
on conflict (id) do nothing;