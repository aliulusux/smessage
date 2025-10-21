-- Channels
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_private boolean not null default false,
  password text, -- demo only (plain). For production, store a hash or move to edge function
  created_at timestamp with time zone default now()
);

create index if not exists channels_name_idx on public.channels (lower(name));

-- Messages
create table if not exists public.messages (
  id bigserial primary key,
  channel_id uuid not null references public.channels(id) on delete cascade,
  username text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create index if not exists messages_channel_created_idx on public.messages (channel_id, created_at);

-- Simple RLS (everyone can read; anyone can insert)
alter table public.channels enable row level security;
alter table public.messages enable row level security;

do $$
begin
  if not exists(select 1 from pg_policies where polname = 'channels_read_all') then
    create policy channels_read_all on public.channels
      for select using (true);
  end if;

  if not exists(select 1 from pg_policies where polname = 'channels_insert_all') then
    create policy channels_insert_all on public.channels
      for insert with check (true);
  end if;

  if not exists(select 1 from pg_policies where polname = 'messages_read_all') then
    create policy messages_read_all on public.messages
      for select using (true);
  end if;

  if not exists(select 1 from pg_policies where polname = 'messages_insert_all') then
    create policy messages_insert_all on public.messages
      for insert with check (true);
  end if;
end$$;

-- Realtime
-- In Supabase dashboard: Database → Replication → Publications → add tables channels, messages to supabase_realtime
