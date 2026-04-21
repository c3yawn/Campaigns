import { keyframes } from '@emotion/react';
import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  Active: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'In Progress': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  'Coming Soon': { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: 'rgba(100,116,139,0.3)' },
};

const twinkle = keyframes`
  0%, 100% { opacity: var(--base-op); }
  50%       { opacity: calc(var(--base-op) * 3.5); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 1px rgba(124,58,237,0.08), 0 4px 20px rgba(124,58,237,0.08); }
  50%       { box-shadow: 0 0 0 1px rgba(124,58,237,0.22), 0 4px 30px rgba(124,58,237,0.22); }
`;

const shimmer = keyframes`
  to { left: 160%; }
`;

const STARS = [
  // small dim — 1px
  { w: '1px',   top: '8%',  left: '6%',  dur: '3.2s', delay: '-0.3s', op: '0.12' },
  { w: '1px',   top: '12%', left: '22%', dur: '4.1s', delay: '-1.6s', op: '0.10' },
  { w: '1px',   top: '18%', left: '38%', dur: '3.7s', delay: '-0.9s', op: '0.13' },
  { w: '1px',   top: '25%', left: '54%', dur: '2.9s', delay: '-2.1s', op: '0.11' },
  { w: '1px',   top: '10%', left: '70%', dur: '4.4s', delay: '-0.5s', op: '0.10' },
  { w: '1px',   top: '5%',  left: '85%', dur: '3.0s', delay: '-1.3s', op: '0.12' },
  { w: '1px',   top: '35%', left: '15%', dur: '3.6s', delay: '-0.7s', op: '0.10' },
  { w: '1px',   top: '42%', left: '32%', dur: '2.8s', delay: '-1.9s', op: '0.13' },
  { w: '1px',   top: '50%', left: '47%', dur: '4.0s', delay: '-0.4s', op: '0.11' },
  { w: '1px',   top: '38%', left: '63%', dur: '3.3s', delay: '-1.1s', op: '0.12' },
  { w: '1px',   top: '20%', left: '78%', dur: '2.6s', delay: '-2.4s', op: '0.10' },
  { w: '1px',   top: '60%', left: '8%',  dur: '3.9s', delay: '-0.6s', op: '0.13' },
  { w: '1px',   top: '68%', left: '26%', dur: '2.7s', delay: '-1.4s', op: '0.11' },
  { w: '1px',   top: '75%', left: '44%', dur: '4.3s', delay: '-0.8s', op: '0.12' },
  { w: '1px',   top: '82%', left: '58%', dur: '3.1s', delay: '-2.0s', op: '0.10' },
  { w: '1px',   top: '90%', left: '74%', dur: '2.5s', delay: '-1.7s', op: '0.13' },
  { w: '1px',   top: '55%', left: '90%', dur: '3.8s', delay: '-0.2s', op: '0.11' },
  { w: '1px',   top: '88%', left: '18%', dur: '4.2s', delay: '-1.0s', op: '0.10' },
  // medium — 1.5px
  { w: '1.5px', top: '9%',  left: '14%', dur: '2.8s', delay: '-0.4s', op: '0.22' },
  { w: '1.5px', top: '22%', left: '42%', dur: '3.5s', delay: '-1.2s', op: '0.20' },
  { w: '1.5px', top: '16%', left: '66%', dur: '2.2s', delay: '-0.8s', op: '0.24' },
  { w: '1.5px', top: '44%', left: '88%', dur: '3.1s', delay: '-0.6s', op: '0.22' },
  { w: '1.5px', top: '58%', left: '34%', dur: '2.6s', delay: '-1.8s', op: '0.20' },
  { w: '1.5px', top: '72%', left: '52%', dur: '3.8s', delay: '-0.3s', op: '0.23' },
  { w: '1.5px', top: '85%', left: '70%', dur: '2.4s', delay: '-1.5s', op: '0.20' },
  { w: '1.5px', top: '33%', left: '76%', dur: '3.3s', delay: '-0.9s', op: '0.22' },
  { w: '1.5px', top: '64%', left: '5%',  dur: '2.9s', delay: '-2.2s', op: '0.20' },
  { w: '1.5px', top: '48%', left: '20%', dur: '4.2s', delay: '-1.1s', op: '0.21' },
  // bright accent — 2px
  { w: '2px',   top: '15%', left: '30%', dur: '2.2s', delay: '-0.8s', op: '0.30' },
  { w: '2px',   top: '30%', left: '58%', dur: '3.8s', delay: '-0.3s', op: '0.28' },
  { w: '2px',   top: '62%', left: '80%', dur: '2.7s', delay: '-0.7s', op: '0.32' },
  { w: '2px',   top: '78%', left: '12%', dur: '3.4s', delay: '-1.5s', op: '0.28' },
  { w: '2px',   top: '52%', left: '46%', dur: '2.5s', delay: '-2.0s', op: '0.30' },
  { w: '2px',   top: '6%',  left: '92%', dur: '3.0s', delay: '-0.5s', op: '0.29' },
  { w: '2px',   top: '92%', left: '36%', dur: '2.8s', delay: '-1.3s', op: '0.31' },
];

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const statusStyle = STATUS_COLORS[project.status] ?? STATUS_COLORS['Coming Soon'];

  return (
    <Card
      sx={{
        background: 'rgba(6, 4, 20, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(124, 58, 237, 0.12)',
        borderRadius: '14px',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 40px ${project.glow}, 0 0 0 1px rgba(124,58,237,0.2)`,
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(project.path)}
        sx={{ height: '100%', alignItems: 'flex-start', '&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 } }}
      >
        <Box
          sx={{
            height: '3px',
            background: project.gradient,
            borderRadius: '14px 14px 0 0',
            filter: `drop-shadow(0 0 8px ${project.glow})`,
          }}
        />

        <CardContent sx={{ p: 3, pb: '20px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Cinzel", serif',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '0.04em',
                background: project.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.3,
                filter: `drop-shadow(0 0 12px ${project.glow})`,
              }}
            >
              {project.title}
            </Typography>
            <Chip
              label={project.status}
              size="small"
              sx={{
                ml: 1.5,
                flexShrink: 0,
                fontSize: '0.6rem',
                height: '20px',
                bgcolor: statusStyle.bg,
                color: statusStyle.color,
                border: `1px solid ${statusStyle.border}`,
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: 'rgba(148, 163, 184, 0.8)',
              fontSize: '0.8rem',
              lineHeight: 1.75,
              mb: 2.5,
            }}
          >
            {project.description}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {project.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    fontSize: '0.6rem',
                    height: '18px',
                    bgcolor: 'rgba(124,58,237,0.1)',
                    color: 'rgba(167,139,250,0.7)',
                    border: '1px solid rgba(124,58,237,0.18)',
                  }}
                />
              ))}
            </Box>
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: 'rgba(167,139,250,0.5)',
                fontFamily: '"Raleway", sans-serif',
                letterSpacing: '0.08em',
                ml: 1,
                flexShrink: 0,
              }}
            >
              Explore →
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
