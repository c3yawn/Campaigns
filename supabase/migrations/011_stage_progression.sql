-- Add juvenile stage between hatchling and adult
alter type creature_stage add value 'juvenile' after 'hatchling';

-- ── game_settings ─────────────────────────────────────────────
-- Single source of truth for tunable game values.
-- To change thresholds: UPDATE game_settings SET value = <n> WHERE key = '<key>';

create table game_settings (
  key         text primary key,
  value       integer not null,
  description text
);

insert into game_settings (key, value, description) values
  ('hatchling_views_threshold', 25,  'Views to progress from hatchling → juvenile'),
  ('juvenile_views_threshold',  100, 'Views to progress from juvenile → adult');

-- Anyone can read settings (needed for public creature page progress bars)
alter table game_settings enable row level security;
create policy "Public read game_settings"
  on game_settings for select
  to anon, authenticated
  using (true);

-- ── Stage progression trigger ──────────────────────────────────
-- Fires after every views update. Reads thresholds from game_settings
-- so no code deploy is needed when tuning values.

create or replace function check_stage_progression()
returns trigger
language plpgsql
security definer
as $$
declare
  v_hatchling_threshold integer;
  v_juvenile_threshold  integer;
begin
  select value into v_hatchling_threshold
    from game_settings where key = 'hatchling_views_threshold';
  select value into v_juvenile_threshold
    from game_settings where key = 'juvenile_views_threshold';

  if NEW.stage = 'hatchling' and NEW.views >= v_hatchling_threshold then
    NEW.stage := 'juvenile';
  elsif NEW.stage = 'juvenile' and NEW.views >= v_juvenile_threshold then
    NEW.stage := 'adult';
    NEW.grew_up_at := now();
  end if;

  return NEW;
end;
$$;

create trigger stage_progression
  before update of views on creatures
  for each row
  execute function check_stage_progression();
