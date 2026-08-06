-- 0005: conversations (per-client chat threads)

create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients (id) on delete cascade,
  owner_id   uuid not null references public.profiles (id) on delete cascade,
  title      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_conversations on public.conversations;
create trigger set_updated_at_conversations
  before update on public.conversations
  for each row execute function public.set_updated_at();