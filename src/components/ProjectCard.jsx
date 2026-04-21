import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  Active: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'In Progress': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  'Coming Soon': { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: 'rgba(100,116,139,0.3)' },
};

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
