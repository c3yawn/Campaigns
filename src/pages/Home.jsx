import { Box, Container, Grid, Typography } from '@mui/material';
import NebulaBackground from '../components/NebulaBackground';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';

export default function Home() {
  return (
    <>
      <NebulaBackground />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: '"Uncial Antiqua", serif',
              fontWeight: 400,
              mb: 2,
              background: 'linear-gradient(135deg, #e2c9ff 0%, #c084fc 40%, #818cf8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              filter: 'drop-shadow(0 0 28px rgba(192, 132, 252, 0.45))',
              letterSpacing: '0.02em',
            }}
          >
            The Infinite Archive
          </Typography>

          <Box sx={{ maxWidth: 580, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4))' }} />
              <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: 'rgba(167,139,250,0.35)', lineHeight: 1 }}>
                {'“'}
              </Typography>
              <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(124,58,237,0.4), transparent)' }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.88rem',
                lineHeight: 1.9,
                color: 'rgba(148, 163, 184, 0.82)',
                letterSpacing: '0.03em',
                mb: 2,
              }}
            >
              Alexander wept when he heard Anaxarchus discourse about an infinite number of worlds, and when his friends inquired what ailed him, 'Is it not worthy of tears,' he said, 'that, when the number of worlds is infinite, we have not yet become lords of a single one?'
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Cinzel", serif',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: 'rgba(124, 58, 237, 0.6)',
                textTransform: 'uppercase',
              }}
            >
              — Plutarch, on Alexander
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {projects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
