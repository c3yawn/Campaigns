create table game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  slot smallint not null default 1 check (slot between 1 and 3),
  data jsonb not null default '{}',
  updated_at timestamptz default now(),
  unique (user_id, slot)
);

alter table game_saves enable row level security;

create policy "Users manage own saves"
  on game_saves for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
