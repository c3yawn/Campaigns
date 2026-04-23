-- ============================================================
-- 004_steam_tracker.sql
-- Run in Supabase SQL Editor: Dashboard → SQL Editor
-- ============================================================

create table if not exists steam_game_status (
  app_id        bigint primary key,
  status        text not null check (status in ('queue', 'in_progress')),
  game_name     text,
  img_icon_url  text,
  added_at      timestamptz default now()
);

alter table steam_game_status enable row level security;

-- Personal tracker — allow anonymous read/write (no user auth required)
create policy "Allow all on steam_game_status"
  on steam_game_status
  for all
  to anon, authenticated
  using (true)
  with check (true);
