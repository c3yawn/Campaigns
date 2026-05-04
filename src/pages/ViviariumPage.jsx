import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography, Card, Chip, Button, Skeleton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import NebulaBackground from '../components/NebulaBackground';

const RARITY_CONFIG = {
  common:    { color: '#94a3b8', label: 'Common' },
  uncommon:  { color: '#4ade80', label: 'Uncommon' },
  rare:      { color: '#38bdf8', label: 'Rare' },
  very_rare: { color: '#c084fc', label: 'Very Rare' },
};

const WORLD_CONFIG = {
  umihotaru: { gradient: 'linear-gradient(145deg, #042f2e 0%, #0d9488 60%, #0ea5e9 100%)', accent: '#0d9488' },
  enlil:     { gradient: 'linear-gradient(145deg, #451a03 0%, #b45309 55%, #fbbf24 100%)', accent: '#f59e0b' },
  taranis:   { gradient: 'linear-gradient(145deg, #1e1b4b 0%, #6d28d9 55%, #a78bfa 100%)', accent: '#a78bfa' },
  janus:     { gradient: 'linear-gradient(90deg, #7f1d1d 0%, #3b0000 45%, #001233 55%, #1e3a5f 100%)', accent: '#ef4444' },
};

function CreatureCard({ creature }) {
  const navigate = useNavigate();
  const rarity = RARITY_CONFIG[creature.species?.rarity] ?? RARITY_CONFIG.common;
  const world = WORLD_CONFIG[creature.species_biome] ?? WORLD_CONFIG.umihotaru;

  return (
    <Card
      onClick={() => navigate(`/arcadia/creature/${creature.id}`)}
      sx={{
        background: 'rgba(6, 4, 20, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(124,58,237,0.12)',
        borderRadius: 2.5,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.22s ease, transform 0.22s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 0 24px ${rarity.color}33`,
          borderColor: `${rarity.color}33`,
        },
      }}
    >
      <Box sx={{ height: 80, background: world.gradient, opacity: 0.75 }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Typography
            sx={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#e2e8f0',
            }}
          >
            {creature.name ?? creature.species?.name ?? 'Unknown'}
          </Typography>
          <Chip
            label={rarity.label}
            size="small"
            sx={{
              fontSize: '0.62rem',
              height: 20,
              fontFamily: '"Raleway", sans-serif',
              fontWeight: 700,
              color: rarity.color,
              background: `${rarity.color}18`,
              border: `1px solid ${rarity.color}44`,
              flexShrink: 0,
              ml: 1,
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            fontFamily: '"Raleway", sans-serif',
            textTransform: 'capitalize',
            mb: 0.5,
          }}
        >
          {creature.species?.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip
            label={creature.stage}
            size="small"
            sx={{
              fontSize: '0.62rem',
              height: 18,
              fontFamily: '"Raleway", sans-serif',
              textTransform: 'capitalize',
              color: '#94a3b8',
              background: 'rgba(148,163,184,0.1)',
              border: '1px solid rgba(148,163,184,0.2)',
            }}
          />
          <Chip
            label={creature.gender}
            size="small"
            sx={{
              fontSize: '0.62rem',
              height: 18,
              fontFamily: '"Raleway", sans-serif',
              textTransform: 'capitalize',
              color: '#94a3b8',
              background: 'rgba(148,163,184,0.1)',
              border: '1px solid rgba(148,163,184,0.2)',
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card sx={{ background: 'rgba(6,4,20,0.88)', border: '1px solid rgba(124,58,237,0.08)', borderRadius: 2.5, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={80} sx={{ bgcolor: 'rgba(124,58,237,0.08)' }} />
      <Box sx={{ p: 2 }}>
        <Skeleton width="60%" height={20} sx={{ bgcolor: 'rgba(124,58,237,0.08)', mb: 1 }} />
        <Skeleton width="40%" height={16} sx={{ bgcolor: 'rgba(124,58,237,0.08)' }} />
      </Box>
    </Card>
  );
}

export default function ViviariumPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    supabase
      .from('creatures')
      .select(`
        id, name, gender, stage, adopted_at,
        species_id,
        species:species_id ( name, rarity )
      `)
      .eq('owner_id', user.id)
      .order('adopted_at', { ascending: false })
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return; }

        // Fetch the biome each species lives in (for world gradient)
        const speciesIds = [...new Set(data.map(c => c.species_id))];
        const { data: biomeRows } = await supabase
          .from('species_biomes')
          .select('species_id, biome_id')
          .in('species_id', speciesIds);

        const speciesBiomeMap = {};
        (biomeRows ?? []).forEach(row => { speciesBiomeMap[row.species_id] = row.biome_id; });

        setCreatures(data.map(c => ({ ...c, species_biome: speciesBiomeMap[c.species_id] ?? 'umihotaru' })));
        setLoading(false);
      });
  }, [user]);

  return (
    <>
      <NebulaBackground src="images/arcadia_bg.mp4" />
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/arcadia')}
          sx={{
            color: '#64748b',
            fontFamily: '"Raleway", sans-serif',
            fontSize: '0.8rem',
            mb: 3,
            '&:hover': { color: '#e2e8f0' },
          }}
        >
          Arcadia
        </Button>

        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              fontSize: { xs: '1.6rem', md: '2.2rem' },
              background: 'linear-gradient(135deg, #0d9488, #7c3aed, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 18px rgba(124,58,237,0.35))',
              mb: 0.5,
            }}
          >
            Vivarium
          </Typography>
          {!loading && creatures.length > 0 && (
            <Typography sx={{ color: '#94a3b8', fontFamily: '"Raleway", sans-serif', fontSize: '0.88rem' }}>
              {creatures.length} {creatures.length === 1 ? 'creature' : 'creatures'} in your collection
            </Typography>
          )}
        </Box>

        {/* Loading */}
        {loading && (
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Not signed in */}
        {!loading && !user && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#94a3b8', fontFamily: '"Raleway", sans-serif', mb: 3 }}>
              Sign in to view your Vivarium.
            </Typography>
            <Button
              onClick={() => navigate('/arcadia')}
              variant="outlined"
              sx={{
                fontFamily: '"Cinzel", serif',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#a78bfa',
                borderColor: 'rgba(167,139,250,0.4)',
                '&:hover': { borderColor: '#a78bfa', background: 'rgba(167,139,250,0.08)' },
              }}
            >
              Back to Arcadia
            </Button>
          </Box>
        )}

        {/* Empty state */}
        {!loading && user && creatures.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography
              sx={{
                fontFamily: '"Cinzel", serif',
                fontSize: '1.1rem',
                color: '#e2e8f0',
                mb: 1.5,
              }}
            >
              Your Vivarium is empty.
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontFamily: '"Raleway", sans-serif', fontSize: '0.9rem', mb: 4 }}>
              Send an expedition to a world and adopt your first creature.
            </Typography>
            <Button
              onClick={() => navigate('/arcadia')}
              variant="contained"
              sx={{
                fontFamily: '"Cinzel", serif',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                px: 4,
                py: 1.25,
                background: 'rgba(124,58,237,0.25)',
                border: '1px solid rgba(124,58,237,0.45)',
                color: '#e2e8f0',
                boxShadow: '0 0 20px rgba(124,58,237,0.2)',
                '&:hover': {
                  background: 'rgba(124,58,237,0.4)',
                  boxShadow: '0 0 32px rgba(124,58,237,0.35)',
                },
              }}
            >
              Explore Worlds
            </Button>
          </Box>
        )}

        {/* Creature grid */}
        {!loading && creatures.length > 0 && (
          <Grid container spacing={2}>
            {creatures.map(creature => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={creature.id}>
                <CreatureCard creature={creature} />
              </Grid>
            ))}
          </Grid>
        )}

      </Container>
    </>
  );
}
