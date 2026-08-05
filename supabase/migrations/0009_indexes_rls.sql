-- 0009: Indexes + Row-Level Security + Grants

-- ─── Indexes ───────────────────────────────────────────────────────────

-- HNSW index for cosine similarity search (RAG retrieval).
create index if not exists document_chunks_embedding_hnsw_idx
  on public.document_chunks using hnsw (embedding vector_cosine_ops);

-- Fast filtering by active model during retrieval.
create index if not exists document_chunks_active_model_idx
  on public.document_chunks (embedding_model, document_id);

create index if not exists clients_owner_idx
  on public.clients (owner_id);

-- ─── Row-Level Security ────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

-- profiles: an accountant manages their own profile.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- clients: owner-only CRUD.
drop policy if exists clients_select_owner on public.clients;
create policy clients_select_owner on public.clients
  for select using (owner_id = auth.uid());

drop policy if exists clients_insert_owner on public.clients;
create policy clients_insert_owner on public.clients
  for insert with check (owner_id = auth.uid());

drop policy if exists clients_update_owner on public.clients;
create policy clients_update_owner on public.clients
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists clients_delete_owner on public.clients;
create policy clients_delete_owner on public.clients
  for delete using (owner_id = auth.uid());

-- conversations: owner-only.
drop policy if exists conversations_select_owner on public.conversations;
create policy conversations_select_owner on public.conversations
  for select using (owner_id = auth.uid());

drop policy if exists conversations_insert_owner on public.conversations;
create policy conversations_insert_owner on public.conversations
  for insert with check (owner_id = auth.uid());

drop policy if exists conversations_update_owner on public.conversations;
create policy conversations_update_owner on public.conversations
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists conversations_delete_owner on public.conversations;
create policy conversations_delete_owner on public.conversations
  for delete using (owner_id = auth.uid());

-- messages: owner access through their conversation.
drop policy if exists messages_select_owner on public.messages;
create policy messages_select_owner on public.messages
  for select using (
    conversation_id in (select id from public.conversations where owner_id = auth.uid())
  );

drop policy if exists messages_insert_owner on public.messages;
create policy messages_insert_owner on public.messages
  for insert with check (
    conversation_id in (select id from public.conversations where owner_id = auth.uid())
  );

-- normativa corpus: shared read-only for authenticated accountants.
drop policy if exists documents_select_authenticated on public.documents;
create policy documents_select_authenticated on public.documents
  for select using (auth.role() = 'authenticated');

drop policy if exists document_chunks_select_authenticated on public.document_chunks;
create policy document_chunks_select_authenticated on public.document_chunks
  for select using (auth.role() = 'authenticated');

-- ─── Grants ────────────────────────────────────────────────────────────
-- Writes to the normativa corpus are done by the backend service role
-- (which bypasses RLS). End users only read it.

grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;

grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;

grant select on public.documents to authenticated;
grant select on public.document_chunks to authenticated;

grant all on public.documents, public.document_chunks to service_role;