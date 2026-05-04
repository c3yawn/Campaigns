-- ============================================================
-- 008_reseed_worlds.sql
-- Replace placeholder earth biomes and animals with the
-- Space Fantasy world/creature roster.
-- Run in Supabase SQL Editor: Dashboard → SQL Editor
-- ============================================================

-- ── Clear placeholder seed data ──────────────────────────────

delete from species_biomes;
delete from species;
delete from biomes;

-- ── Drop old enum values, replace biome_theme ────────────────
-- biome_theme was: 'wild' | 'space' | 'fantasy'
-- Replace with world-specific themes that match the new roster.

alter type biome_theme rename to biome_theme_old;

create type biome_theme as enum (
  'bioluminescent',   -- Umihotaru
  'savanna',          -- Enlil
  'tempest',          -- Taranis
  'divide'            -- Janus
);

alter table biomes
  alter column theme type biome_theme
  using theme::text::biome_theme;

drop type biome_theme_old;

-- ── Worlds (biomes) ──────────────────────────────────────────
-- Each world is a single biome for now; sub-biomes can be added later.

insert into biomes (id, name, description, theme, is_event, is_active) values
  (
    'umihotaru',
    'Umihotaru',
    'Warm shallow seas beneath towering bioluminescent jungle. Most visited planet in the system. On the 3rd or 4th night in the glowing shallows, visitors report feeling — with total certainty — that something benevolent is watching them.',
    'bioluminescent',
    false,
    true
  ),
  (
    'enlil',
    'Enlil',
    'Endless warm savanna under amber skies. The largest species (14m at the shoulder) walks through human settlements without altering its path — through walls, vehicles, anything. You are scenery. The planet does not hate you. It doesn''t notice you.',
    'savanna',
    false,
    true
  ),
  (
    'taranis',
    'Taranis',
    'Permanent electromagnetic superstorms. Vast crystal cave networks below. Electronics attract cave creatures like blood attracts predators. After 6 months underground, some settlers have begun sensing EM field shifts the way the creatures do.',
    'tempest',
    false,
    true
  ),
  (
    'janus',
    'Janus',
    'One hemisphere volcanic inferno, one dead ice. All life exists in the 180km Terminator strip. Xenoarchaeologists have found 4 distinct pre-human civilizations, all built along the exact same strip, all ended abruptly with no evidence of war or disaster.',
    'divide',
    false,
    false  -- locked at launch; unlocks via progression
  );

-- ── Species ──────────────────────────────────────────────────

insert into species (id, name, description, rarity, is_hybrid) values
  -- Umihotaru
  (
    'lumoth',
    'Lumoth',
    'Small moth-like flier with bioluminescent wing-dust. Common in the upper canopy. The first creature most visitors see.',
    'common',
    false
  ),
  (
    'veloshade',
    'Veloshade',
    'Canopy-gliding manta the size of a hawk. Hunts insects in the spore clouds. Harmless unless cornered.',
    'uncommon',
    false
  ),
  (
    'reefwyrm',
    'Reefwyrm',
    'Serpentine reef-dweller. Iridescent, fast, up to 4 metres long. Feeds on bioluminescent coral polyps. Beautiful and faintly unsettling at depth.',
    'rare',
    false
  ),
  -- Enlil
  (
    'duskstrider',
    'Duskstrider',
    'Six-legged herd ungulate. Travels in hundreds. During the amber dusk migrations the ground vibrates 12 hours before they arrive.',
    'common',
    false
  ),
  (
    'ashwolf',
    'Ashwolf',
    'Lean pack predator with heat-cracked hide. Hunts Duskstrider calves at the herd edges. Settlers report being followed for days before an attack — or not.',
    'uncommon',
    false
  ),
  (
    'thornback',
    'Thornback',
    'Enlil''s megafauna apex. Rhino-scaled, 4x the mass, blade-like dorsal ridges that ring like struck iron in high winds.',
    'rare',
    false
  ),
  -- Taranis
  (
    'shardback',
    'Shardback',
    'Four-legged cave creature with crystalline plating. Absorbs ambient lightning and discharges in concentrated bursts when threatened. Blind. Navigates entirely by EM sense.',
    'uncommon',
    false
  ),
  (
    'tempest_ray',
    'Tempest Ray',
    'Airborne, with electromagnetic wing-membranes that crackle visibly during storm season. Flocks of hundreds ride the superstorm fronts. Individually docile. In a flock, unpredictable.',
    'rare',
    false
  ),
  (
    'vortaxis',
    'Vortaxis',
    'Taranis''s crystalline apex predator. Warps local EM fields to disorient prey. No confirmed population count — surveys lose equipment before getting a reliable number.',
    'very_rare',
    false
  ),
  -- Janus
  (
    'cinderstalker',
    'Cinderstalker',
    'The Terminator strip''s dominant predator. Fire-resistant on one flank, cold-tolerant on the other. Hunts by driving prey toward whichever edge they''re less adapted for.',
    'rare',
    false
  ),
  (
    'emberclaw',
    'Emberclaw',
    'Comes from the volcanic hemisphere to hunt the strip. Obsidian scales. Heat radiates off its body visibly in cold air. Stays only as long as it needs to.',
    'very_rare',
    false
  ),
  (
    'glaciarch',
    'Glaciarch',
    'Ancient massive creature from the ice hemisphere. Rarely sighted in the strip. No reliable size estimate exists — reported lengths range from 6m to 60m. Xenobiologists suspect these are not the same animal.',
    'very_rare',
    false
  );

-- ── Species ↔ Worlds ─────────────────────────────────────────

insert into species_biomes (species_id, biome_id, spawn_weight) values
  ('lumoth',        'umihotaru', 30),
  ('veloshade',     'umihotaru', 15),
  ('reefwyrm',      'umihotaru',  5),
  ('duskstrider',   'enlil',     28),
  ('ashwolf',       'enlil',     14),
  ('thornback',     'enlil',      4),
  ('shardback',     'taranis',   18),
  ('tempest_ray',   'taranis',    8),
  ('vortaxis',      'taranis',    2),
  ('cinderstalker', 'janus',      6),
  ('emberclaw',     'janus',      2),
  ('glaciarch',     'janus',      1);
