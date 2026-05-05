import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WORLD: Record<string, { bg: string; accent: string; mid: string }> = {
  umihotaru: { bg: '#021a19', accent: '#0d9488', mid: '#0ea5e9' },
  enlil:     { bg: '#1c0a00', accent: '#f59e0b', mid: '#b45309' },
  taranis:   { bg: '#0e0c24', accent: '#a78bfa', mid: '#6d28d9' },
  janus:     { bg: '#0d0000', accent: '#ef4444', mid: '#7f1d1d' },
};

const RARITY_COLOR: Record<string, string> = {
  common:    '#94a3b8',
  uncommon:  '#4ade80',
  rare:      '#38bdf8',
  very_rare: '#c084fc',
};

const RARITY_LABEL: Record<string, string> = {
  common:    'Common',
  uncommon:  'Uncommon',
  rare:      'Rare',
  very_rare: 'Very Rare',
};

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

function buildSvg(opts: {
  speciesName: string;
  rarityKey: string;
  stage: string;
  worldKey: string;
}): string {
  const w = WORLD[opts.worldKey] ?? WORLD.umihotaru;
  const rarityColor = RARITY_COLOR[opts.rarityKey] ?? RARITY_COLOR.common;
  const rarityLabel = RARITY_LABEL[opts.rarityKey] ?? 'Common';
  const stage = opts.stage.charAt(0).toUpperCase() + opts.stage.slice(1);

  // Escape XML entities in user-facing strings
  const safeName = opts.speciesName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${w.accent}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${w.bg}" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="sphere" cx="38%" cy="34%" r="65%">
      <stop offset="0%" stop-color="${w.mid}" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="${w.accent}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${w.bg}" stop-opacity="0.4"/>
    </radialGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg)"/>

  <!-- Outer ring glow -->
  <circle cx="200" cy="175" r="108" fill="none"
    stroke="${w.accent}" stroke-width="1" stroke-opacity="0.25" filter="url(#softglow)"/>

  <!-- Ring -->
  <circle cx="200" cy="175" r="108" fill="none"
    stroke="${w.accent}" stroke-width="0.75" stroke-opacity="0.35"/>

  <!-- Sphere body -->
  <circle cx="200" cy="175" r="80" fill="url(#sphere)" filter="url(#glow)"/>

  <!-- Specular highlight -->
  <ellipse cx="172" cy="147" rx="22" ry="14"
    fill="white" fill-opacity="0.18" transform="rotate(-20 172 147)"/>

  <!-- Rarity dot strip -->
  <rect x="168" y="282" width="64" height="2" rx="1"
    fill="${rarityColor}" fill-opacity="0.6"/>

  <!-- Species name -->
  <text x="200" y="320"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="20" font-weight="bold"
    fill="#e2e8f0" fill-opacity="0.95"
    text-anchor="middle" letter-spacing="0.5">
    ${safeName}
  </text>

  <!-- Rarity · Stage line -->
  <text x="200" y="342"
    font-family="Arial, Helvetica, sans-serif"
    font-size="12" fill="${rarityColor}" fill-opacity="0.85"
    text-anchor="middle" letter-spacing="1">
    ${rarityLabel.toUpperCase()} · ${stage.toUpperCase()}
  </text>

  <!-- Watermark -->
  <text x="200" y="388"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="10" fill="white" fill-opacity="0.2"
    text-anchor="middle" letter-spacing="4">
    ARCADIA
  </text>
</svg>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  // Parse creature ID from path: /functions/v1/creature-sprite/<uuid>
  const parts = new URL(req.url).pathname.split('/').filter(Boolean);
  const creatureId = parts[parts.length - 1];

  if (!creatureId || creatureId === 'creature-sprite') {
    return new Response('Not found', { status: 404, headers: cors });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: creature, error } = await supabase
    .from('creatures')
    .select(`
      id, name, stage, species_id,
      species:species_id ( name, rarity )
    `)
    .eq('id', creatureId)
    .single();

  if (error || !creature) {
    return new Response('Not found', { status: 404, headers: cors });
  }

  // Fetch the world this species lives in
  const { data: biomeRow } = await supabase
    .from('species_biomes')
    .select('biome_id')
    .eq('species_id', creature.species_id)
    .limit(1)
    .single();

  const worldKey = biomeRow?.biome_id ?? 'umihotaru';
  const species = creature.species as { name: string; rarity: string } | null;

  // Log the view — await so errors show in Edge Function logs
  const { error: rpcError } = await supabase.rpc('increment_creature_views', { p_creature_id: creatureId });
  if (rpcError) console.error('increment_creature_views failed:', rpcError.message, rpcError.code);

  // Check Supabase Storage for a real sprite first
  const { data: spriteFile } = await supabase.storage
    .from('creature-sprites')
    .download(`${creature.species_id}.png`);

  if (spriteFile) {
    const arrayBuffer = await spriteFile.arrayBuffer();
    return new Response(arrayBuffer, {
      headers: {
        ...cors,
        'Content-Type': 'image/png',
        // 1-hour cache — Discord proxy re-fetches each hour, registering a view per cluster
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
      },
    });
  }

  // Fall back to generated SVG
  const svg = buildSvg({
    speciesName: species?.name ?? 'Unknown',
    rarityKey: species?.rarity ?? 'common',
    stage: creature.stage ?? 'hatchling',
    worldKey,
  });

  return new Response(svg, {
    headers: {
      ...cors,
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
    },
  });
});
