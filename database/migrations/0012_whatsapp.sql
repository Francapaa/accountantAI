-- 0012: WhatsApp connections, client phone, and message transport state
--
-- Backs the Meta Cloud API adapter (docs/sdd/010-whatsapp-adapter.md):
--   - `whatsapp_connections`: per-account link to a WhatsApp Business number
--     (waba_id + phone_number_id). The webhook routes inbound events to the
--     owner via `phone_number_id`; the sender's `wa_id` is matched to a client
--     via `clients.phone`.
--   - `clients.phone`: E.164 number of the client's WhatsApp, used to match
--     inbound messages to a workspace.
--   - `messages` gains transport fields: `provider`, `provider_message_id`
--     (idempotency/dedup on Meta retries), `direction`, and `status` for the
--     capture → draft → approve → sent flow.

-- ─── whatsapp_connections ─────────────────────────────────────────────

create table if not exists public.whatsapp_connections (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles (id) on delete cascade,
  provider         text not null default 'meta',
  waba_id          text not null,
  phone_number_id  text not null,
  phone_number     text,
  status           text not null default 'pending' check (status in ('pending', 'connected', 'error')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (owner_id, phone_number_id)
);

drop trigger if exists set_updated_at_whatsapp_connections on public.whatsapp_connections;
create trigger set_updated_at_whatsapp_connections
  before update on public.whatsapp_connections
  for each row execute function public.set_updated_at();

create index if not exists whatsapp_connections_owner_idx
  on public.whatsapp_connections (owner_id);

create index if not exists whatsapp_connections_phone_number_id_idx
  on public.whatsapp_connections (phone_number_id);

-- ─── clients.phone ────────────────────────────────────────────────────

alter table public.clients
  add column if not exists phone text;

create index if not exists clients_owner_phone_idx
  on public.clients (owner_id, phone);

-- ─── messages: transport state ────────────────────────────────────────

alter table public.messages
  add column if not exists provider text,
  add column if not exists provider_message_id text,
  add column if not exists direction text not null default 'outbound'
    check (direction in ('inbound', 'outbound')),
  add column if not exists status text not null default 'sent'
    check (status in ('received', 'draft', 'sent', 'failed'));

-- Partial unique index: dedup on provider re-deliveries without colliding on
-- the NULL values of pre-existing (web chat) messages.
create unique index if not exists messages_provider_message_id_uidx
  on public.messages (provider_message_id)
  where provider_message_id is not null;

-- ─── Row-Level Security ───────────────────────────────────────────────

alter table public.whatsapp_connections enable row level security;

drop policy if exists whatsapp_connections_select_owner on public.whatsapp_connections;
create policy whatsapp_connections_select_owner on public.whatsapp_connections
  for select using (owner_id = auth.uid());

drop policy if exists whatsapp_connections_insert_owner on public.whatsapp_connections;
create policy whatsapp_connections_insert_owner on public.whatsapp_connections
  for insert with check (owner_id = auth.uid());

drop policy if exists whatsapp_connections_update_owner on public.whatsapp_connections;
create policy whatsapp_connections_update_owner on public.whatsapp_connections
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists whatsapp_connections_delete_owner on public.whatsapp_connections;
create policy whatsapp_connections_delete_owner on public.whatsapp_connections
  for delete using (owner_id = auth.uid());

-- ─── Grants ───────────────────────────────────────────────────────────
-- Connections are owned per accountant (RLS); the backend service role writes
-- message transport state on inbound/outbound sends.

grant select, insert, update, delete on public.whatsapp_connections to authenticated;

grant select, insert, update on public.messages to service_role;
grant update on public.clients to service_role;
