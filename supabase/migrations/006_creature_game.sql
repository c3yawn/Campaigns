-- ============================================================
-- 006_creature_game.sql
-- Creature adoption/breeding game schema
-- Run in Supabase SQL Editor: Dashboard → SQL Editor
--
-- Safe to run alongside existing migrations 001-005.
-- Does NOT recreate profiles, its RLS, or its existing policies.
-- Only adds the username column and creates all new tables.
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

create type rarity_tier     as enum ('common', 'uncommon', 'rare', 'very_rare');
create type creature_gender  as enum ('male', 'female');
create type creature_stage   as enum ('egg', 'hatchling', 'adult');
create type breeding_outcome as enum ('egg_produced', 'refused', 'no_interest');
create type trade_status     as enum ('open', 'accepted', 'declined', 'cancelled');
create type transfer_status  as enum ('pending', 'claimed', 'expired');
create type biome_theme      as enum ('wild', 'space', 'fantasy');

-- ── Extend profiles (non-destructive) ────────────────────────
-- Nullable so existing rows (TTRPG users) are unaffected.
-- Username is set on first login via the username setup flow.
-- Check constraint enforces alphanumeric + underscores, 3-20 chars.

alter table profiles
  add column if not exists username text unique
    check (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- ── biomes ───────────────────────────────────────────────────

create table biomes (
  id               text primary key,
  name             text not null,
  description      text,
  theme            biome_theme not null default 'wild',
  is_event         boolean not null default false,
  is_active        boolean not null default true,
  available_from   timestamptz,
  available_until  timestamptz
);

alter table biomes enable row level security;

create policy "Public read active biomes"
  on biomes for select
  to anon, authenticated
  using (is_active = true);

-- ── species ──────────────────────────────────────────────────

create table species (
  id               text primary key,
  name             text not null,
  description      text,
  rarity           rarity_tier not null default 'common',
  is_hybrid        boolean not null default false,
  hybrid_parent_1  text references species(id),
  hybrid_parent_2  text references species(id),
  egg_sprite       text,
  hatchling_sprite text,
  adult_sprite     text
);

alter table species enable row level security;

create policy "Public read species"
  on species for select
  to anon, authenticated
  using (true);

-- ── species_biomes ───────────────────────────────────────────

create table species_biomes (
  species_id    text not null references species(id) on delete cascade,
  biome_id      text not null references biomes(id) on delete cascade,
  spawn_weight  int not null default 10,
  primary key (species_id, biome_id)
);

alter table species_biomes enable row level security;

create policy "Public read species_biomes"
  on species_biomes for select
  to anon, authenticated
  using (true);

-- ── creatures ────────────────────────────────────────────────

create table creatures (
  id              uuid primary key default gen_random_uuid(),
  species_id      text not null references species(id),
  owner_id        uuid references profiles(id) on delete set null,
  name            text unique,
  gender          creature_gender not null,
  stage           creature_stage not null default 'egg',
  is_cave_born    boolean not null default true,
  is_abandoned    boolean not null default false,
  mother_id       uuid references creatures(id) on delete set null,
  father_id       uuid references creatures(id) on delete set null,
  generation      int not null default 1,
  views           int not null default 0,
  unique_views    int not null default 0,
  clicks          int not null default 0,
  stage_deadline  timestamptz,
  adopted_at      timestamptz not null default now(),
  hatched_at      timestamptz,
  grew_up_at      timestamptz,
  abandoned_at    timestamptz
);

alter table creatures enable row level security;

create policy "Public read creatures"
  on creatures for select
  to anon, authenticated
  using (true);

create policy "Owners manage their creatures"
  on creatures for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index creatures_owner_idx     on creatures(owner_id);
create index creatures_species_idx   on creatures(species_id);
create index creatures_abandoned_idx on creatures(is_abandoned) where is_abandoned = true;

-- ── creature_views ───────────────────────────────────────────

create table creature_views (
  creature_id    uuid not null references creatures(id) on delete cascade,
  viewer_id      uuid not null references profiles(id) on delete cascade,
  view_count     int not null default 1,
  clicked        boolean not null default false,
  last_viewed_at timestamptz not null default now(),
  primary key (creature_id, viewer_id)
);

alter table creature_views enable row level security;

create policy "Authenticated manage own views"
  on creature_views for all
  to authenticated
  using (auth.uid() = viewer_id)
  with check (auth.uid() = viewer_id);

-- ── breeding_records ─────────────────────────────────────────

create table breeding_records (
  id                      uuid primary key default gen_random_uuid(),
  parent_1_id             uuid not null references creatures(id),
  parent_2_id             uuid not null references creatures(id),
  offspring_id            uuid references creatures(id),
  outcome                 breeding_outcome not null,
  initiated_by            uuid not null references profiles(id),
  parent_1_cooldown_until timestamptz not null,
  parent_2_cooldown_until timestamptz not null,
  created_at              timestamptz not null default now()
);

alter table breeding_records enable row level security;

create policy "Public read breeding_records"
  on breeding_records for select
  to anon, authenticated
  using (true);

create policy "Authenticated insert breeding_records"
  on breeding_records for insert
  to authenticated
  with check (auth.uid() = initiated_by);

create index breeding_parent1_idx on breeding_records(parent_1_id);
create index breeding_parent2_idx on breeding_records(parent_2_id);

-- ── trades ───────────────────────────────────────────────────

create table trades (
  id                     uuid primary key default gen_random_uuid(),
  offerer_id             uuid not null references profiles(id),
  offered_creature_id    uuid not null references creatures(id),
  requested_creature_id  uuid references creatures(id),
  receiver_id            uuid references profiles(id),
  status                 trade_status not null default 'open',
  created_at             timestamptz not null default now(),
  expires_at             timestamptz
);

alter table trades enable row level security;

create policy "Public read open trades"
  on trades for select
  to anon, authenticated
  using (true);

create policy "Offerers manage own trades"
  on trades for all
  to authenticated
  using (auth.uid() = offerer_id)
  with check (auth.uid() = offerer_id);

-- ── transfers ────────────────────────────────────────────────

create table transfers (
  id            uuid primary key default gen_random_uuid(),
  token         text not null unique default gen_random_uuid()::text,
  from_user_id  uuid not null references profiles(id),
  to_user_id    uuid references profiles(id),
  creature_id   uuid not null references creatures(id),
  status        transfer_status not null default 'pending',
  created_at    timestamptz not null default now(),
  expires_at    timestamptz
);

alter table transfers enable row level security;

create policy "Participants read own transfers"
  on transfers for select
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Senders manage own transfers"
  on transfers for all
  to authenticated
  using (auth.uid() = from_user_id)
  with check (auth.uid() = from_user_id);

create policy "Public read transfers by token"
  on transfers for select
  to anon, authenticated
  using (true);

-- ── Seed: placeholder biomes ─────────────────────────────────

insert into biomes (id, name, description, theme, is_active) values
  ('forest',    'The Forest',    'Dense woodland teeming with shy creatures.',      'wild', true),
  ('wetlands',  'The Wetlands',  'Murky swamps and slow rivers.',                   'wild', true),
  ('mountains', 'The Mountains', 'High peaks where hardy animals make their home.', 'wild', true),
  ('savanna',   'The Savanna',   'Open grasslands under a wide sky.',               'wild', true),
  ('tundra',    'The Tundra',    'Frozen expanses, sparse but full of surprises.',  'wild', true),
  ('deep_sea',  'The Deep Sea',  'Lightless depths hiding creatures rarely seen.',  'wild', false);

-- ── Seed: placeholder species ────────────────────────────────

insert into species (id, name, rarity, is_hybrid) values
  ('wolf',    'Wolf',    'common',   false),
  ('fox',     'Fox',     'common',   false),
  ('bear',    'Bear',    'uncommon', false),
  ('eagle',   'Eagle',   'uncommon', false),
  ('lynx',    'Lynx',    'rare',     false),
  ('gorecat', 'Gorecat', 'rare',     true);

update species set hybrid_parent_1 = 'bear', hybrid_parent_2 = 'fox' where id = 'gorecat';

insert into species_biomes (species_id, biome_id, spawn_weight) values
  ('wolf',  'forest',    15),
  ('wolf',  'mountains', 10),
  ('fox',   'forest',    20),
  ('fox',   'tundra',    15),
  ('bear',  'forest',     8),
  ('bear',  'mountains',  8),
  ('eagle', 'mountains', 10),
  ('eagle', 'savanna',   10),
  ('lynx',  'mountains',  4),
  ('lynx',  'tundra',     4);
