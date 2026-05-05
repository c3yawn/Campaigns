import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box, Container, Typography, Button, Chip, CircularProgress,
  TextField, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import NebulaBackground from '../components/NebulaBackground';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const RARITY_CONFIG = {
  common:    { color: '#94a3b8', label: 'Common' },
  uncommon:  { color: '#4ade80', label: 'Uncommon' },
  rare:      { color: '#38bdf8', label: 'Rare' },
  very_rare: { color: '#c084fc', label: 'Very Rare' },
};

const WORLD_CONFIG = {
  umihotaru: {
    gradient: 'linear-gradient(145deg, #042f2e 0%, #0d9488 60%, #0ea5e9 100%)',
    accent: '#0d9488',
    label: 'Umihotaru',
  },
  enlil: {
    gradient: 'linear-gradient(145deg, #451a03 0%, #b45309 55%, #fbbf24 100%)',
    accent: '#f59e0b',
    label: 'Enlil',
  },
  taranis: {
    gradient: 'linear-gradient(145deg, #1e1b4b 0%, #6d28d9 55%, #a78bfa 100%)',
    accent: '#a78bfa',
    label: 'Taranis',
  },
  janus: {
    gradient: 'linear-gradient(90deg, #7f1d1d 0%, #3b0000 45%, #001233 55%, #1e3a5f 100%)',
    accent: '#ef4444',
    label: 'Janus',
  },
};

function StatRow({ label, value, valueColor }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
      <Typography sx={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.88rem', color: valueColor ?? '#e2e8f0', textTransform: 'capitalize' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function CreaturePage() {
  const { creatureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [creature, setCreature] = useState(null);
  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('creatures')
        .select(`
          id, name, gender, stage, generation, views, unique_views,
          is_cave_born, adopted_at, hatched_at, grew_up_at,
          owner_id,
          species:species_id ( id, name, rarity, description )
        `)
        .eq('id', creatureId)
        .single();

      if (error || !data) { setNotFound(true); setLoading(false); return; }

      const { data: biomeRows } = await supabase
        .from('species_biomes')
        .select('biome_id')
        .eq('species_id', data.species.id)
        .limit(1)
        .single();

      setCreature(data);
      setNameInput(data.name ?? '');
      setWorld(biomeRows?.biome_id ?? 'umihotaru');
      setLoading(false);
    }
    load();
  }, [creatureId]);

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError('Name cannot be empty.'); return; }
    if (trimmed.length < 2) { setNameError('Name must be at least 2 characters.'); return; }
    if (trimmed.length > 30) { setNameError('Name must be 30 characters or fewer.'); return; }

    setNameSaving(true);
    setNameError('');

    const { error } = await supabase
      .from('creatures')
      .update({ name: trimmed })
      .eq('id', creatureId)
      .eq('owner_id', user.id);

    setNameSaving(false);
    if (error) {
      setNameError(error.code === '23505' ? 'That name is already taken.' : 'Failed to save. Try again.');
    } else {
      setCreature(prev => ({ ...prev, name: trimmed }));
      setEditing(false);
    }
  }

  const isOwner = user && creature && user.id === creature.owner_id;
  const rarity = RARITY_CONFIG[creature?.species?.rarity] ?? RARITY_CONFIG.common;
  const worldCfg = WORLD_CONFIG[world] ?? WORLD_CONFIG.umihotaru;

  // Build OG values — used once creature data is loaded
  const displayName = creature?.name ?? creature?.species?.name ?? 'Unknown';
  const spriteUrl = creature
    ? `${SUPABASE_URL}/functions/v1/creature-sprite/${creatureId}`
    : null;
  const pageUrl = `https://c3yawn.github.io/Yawniverse/arcadia/creature/${creatureId}`;
  const ogTitle = creature
    ? `${displayName} — ${RARITY_CONFIG[creature.species?.rarity]?.label ?? 'Creature'} · Arcadia`
    : 'Arcadia — Creature Collection';
  const ogDescription = creature
    ? `A ${creature.stage} ${creature.species?.name ?? 'creature'} from ${WORLD_CONFIG[world]?.label ?? 'the stars'}. Views: ${creature.views}`
    : 'Adopt and raise creatures from across charted space.';

  if (loading) {
    return (
      <>
        <NebulaBackground src="images/arcadia_bg.mp4" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', position: 'relative', zIndex: 1 }}>
          <CircularProgress sx={{ color: '#7c3aed' }} />
        </Box>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <NebulaBackground src="images/arcadia_bg.mp4" />
        <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontFamily: '"Cinzel", serif', fontSize: '1.1rem', color: '#e2e8f0', mb: 1 }}>
            Creature not found.
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontFamily: '"Raleway", sans-serif', mb: 4 }}>
            It may have been released or never existed.
          </Typography>
          <Button onClick={() => navigate('/arcadia/vivarium')} sx={{ color: '#94a3b8', fontFamily: '"Raleway", sans-serif', '&:hover': { color: '#e2e8f0' } }}>
            Back to Vivarium
          </Button>
        </Container>
      </>
    );
  }

  const adoptedDate = new Date(creature.adopted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        {spriteUrl && <meta property="og:image" content={spriteUrl} />}
        {spriteUrl && <meta property="og:image:width" content="400" />}
        {spriteUrl && <meta property="og:image:height" content="400" />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        {spriteUrl && <meta name="twitter:image" content={spriteUrl} />}
      </Helmet>
      <NebulaBackground src="images/arcadia_bg.mp4" />
      <Container maxWidth="md" sx={{ py: 6, position: 'relative', zIndex: 1 }}>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/arcadia/vivarium')}
          sx={{ color: '#64748b', fontFamily: '"Raleway", sans-serif', fontSize: '0.8rem', mb: 3, '&:hover': { color: '#e2e8f0' } }}
        >
          Vivarium
        </Button>

        {/* Header banner */}
        <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, border: '1px solid rgba(124,58,237,0.12)' }}>
          <Box sx={{ height: 120, background: worldCfg.gradient, position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(6,4,20,0.95) 100%)' }} />

            {/* Sprite placeholder — replaced with actual art later */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -32,
                left: { xs: '50%', sm: 48 },
                transform: { xs: 'translateX(-50%)', sm: 'none' },
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${worldCfg.accent}88, ${worldCfg.accent}22)`,
                border: `2px solid ${worldCfg.accent}66`,
                boxShadow: `0 0 24px ${worldCfg.accent}44`,
              }}
            />
          </Box>

          <Box
            sx={{
              background: 'rgba(6,4,20,0.92)',
              backdropFilter: 'blur(20px)',
              px: { xs: 3, sm: 5 },
              pt: { xs: 6, sm: 3 },
              pb: 3,
              pl: { sm: '144px' },
            }}
          >
            {/* Name row */}
            {editing && isOwner ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, maxWidth: 340 }}>
                <TextField
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false); }}
                  size="small"
                  autoFocus
                  error={!!nameError}
                  helperText={nameError || ''}
                  inputProps={{ maxLength: 30 }}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: '#e2e8f0',
                      '& fieldset': { borderColor: `${worldCfg.accent}55` },
                      '&:hover fieldset': { borderColor: `${worldCfg.accent}99` },
                      '&.Mui-focused fieldset': { borderColor: worldCfg.accent },
                    },
                    '& .MuiFormHelperText-root': { fontFamily: '"Raleway", sans-serif', fontSize: '0.72rem' },
                  }}
                />
                <IconButton onClick={saveName} disabled={nameSaving} size="small" sx={{ color: worldCfg.accent }}>
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#e2e8f0' }}>
                  {displayName}
                </Typography>
                {isOwner && (
                  <IconButton onClick={() => setEditing(true)} size="small" sx={{ color: '#64748b', '&:hover': { color: '#94a3b8' } }}>
                    <EditIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                )}
              </Box>
            )}

            {creature.name && (
              <Typography sx={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>
                {creature.species?.name}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label={rarity.label}
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  height: 20,
                  fontFamily: '"Raleway", sans-serif',
                  fontWeight: 700,
                  color: rarity.color,
                  background: `${rarity.color}18`,
                  border: `1px solid ${rarity.color}44`,
                }}
              />
              <Chip
                label={worldCfg.label}
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  height: 20,
                  fontFamily: '"Raleway", sans-serif',
                  color: worldCfg.accent,
                  background: `${worldCfg.accent}18`,
                  border: `1px solid ${worldCfg.accent}44`,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Species description */}
        {creature.species?.description && (
          <Box
            sx={{
              background: 'rgba(6,4,20,0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124,58,237,0.1)',
              borderRadius: 2.5,
              p: 3,
              mb: 3,
            }}
          >
            <Typography sx={{ fontFamily: '"Raleway", sans-serif', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.75, fontStyle: 'italic' }}>
              {creature.species.description}
            </Typography>
          </Box>
        )}

        {/* Stats panel */}
        <Box
          sx={{
            background: 'rgba(6,4,20,0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.1)',
            borderRadius: 2.5,
            px: 3,
            py: 1,
          }}
        >
          <StatRow label="Stage" value={creature.stage} />
          <StatRow label="Gender" value={creature.gender} />
          <StatRow label="Generation" value={`Gen ${creature.generation}`} />
          <StatRow label="Origin" value={creature.is_cave_born ? 'Wild-born' : 'Bred'} />
          <StatRow label="Adopted" value={adoptedDate} />
          <StatRow label="Views" value={creature.views.toLocaleString()} valueColor="#94a3b8" />
        </Box>

        {/* Owner name hint */}
        {isOwner && !creature.name && !editing && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              onClick={() => setEditing(true)}
              sx={{ color: '#64748b', fontFamily: '"Raleway", sans-serif', fontSize: '0.8rem', '&:hover': { color: '#e2e8f0' } }}
            >
              Give this creature a name
            </Button>
          </Box>
        )}

      </Container>
    </>
  );
}
