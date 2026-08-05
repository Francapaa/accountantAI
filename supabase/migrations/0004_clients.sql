-- 0004: clients (workspaces + persistent context)

create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  name        text not null,
  province    text,
  tax_regime  text,
  activity    text,
  notes_public text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists set_updated_at_clients on public.clients;
create trigger set_updated_at_clients
  before update on public.clients
  for each row execute function public.set_updated_at();