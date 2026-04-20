import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const drift1 = keyframes`
  0%   { transform: translate(0%, 0%) scale(1); }
  33%  { transform: translate(3%, -4%) scale(1.06); }
  66%  { transform: translate(-2%, 3%) scale(0.97); }
  100% { transform: translate(0%, 0%) scale(1); }
`;

const drift2 = keyframes`
  0%   { transform: translate(0%, 0%) scale(1.05); }
  33%  { transform: translate(-4%, 2%) scale(0.98); }
  66%  { transform: translate(3%, -3%) scale(1.08); }
  100% { transform: translate(0%, 0%) scale(1.05); }
`;

const drift3 = keyframes`
  0%   { transform: translate(0%, 0%) scale(0.95); }
  50%  { transform: translate(2%, 4%) scale(1.04); }
  100% { transform: translate(0%, 0%) scale(0.95); }
`;

const pulse = keyframes`
  0%   { opacity: 0.55; }
  50%  { opacity: 0.70; }
  100% { opacity: 0.55; }
`;

const blobBase = {
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(80px)',
  mixBlendMode: 'screen',
};

export default function NebulaBackground() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        backgroundColor: '#050510',
      }}
    >
      {/* Star field layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 80%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 55%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 90%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 45%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 78%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 33% 12%, rgba(200,200,255,0.6) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 88% 38%, rgba(200,220,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 48% 70%, rgba(220,200,255,0.55) 0%, transparent 100%)
          `,
        }}
      />

      {/* Deep purple nebula cloud — top-left */}
      <Box
        sx={{
          ...blobBase,
          width: '55vw',
          height: '55vw',
          top: '-15vw',
          left: '-10vw',
          background: 'radial-gradient(circle, #3b0a6e 0%, #1a0040 45%, transparent 72%)',
          animation: `${drift1} 50s ease-in-out infinite, ${pulse} 18s ease-in-out infinite`,
          opacity: 0.6,
        }}
      />

      {/* Teal nebula cloud — bottom-right */}
      <Box
        sx={{
          ...blobBase,
          width: '50vw',
          height: '50vw',
          bottom: '-12vw',
          right: '-8vw',
          background: 'radial-gradient(circle, #00453d 0%, #002a26 45%, transparent 72%)',
          animation: `${drift2} 60s ease-in-out infinite, ${pulse} 22s ease-in-out infinite`,
          opacity: 0.5,
        }}
      />

      {/* Blue nebula cloud — center */}
      <Box
        sx={{
          ...blobBase,
          width: '45vw',
          height: '45vw',
          top: '25vh',
          left: '30vw',
          background: 'radial-gradient(circle, #0d2a6e 0%, #060f40 50%, transparent 72%)',
          animation: `${drift3} 45s ease-in-out infinite`,
          opacity: 0.45,
        }}
      />

      {/* Accent: soft purple-pink wisp — top-right */}
      <Box
        sx={{
          ...blobBase,
          width: '30vw',
          height: '30vw',
          top: '5vh',
          right: '8vw',
          background: 'radial-gradient(circle, #5b1a8a 0%, #2d0060 50%, transparent 72%)',
          animation: `${drift2} 55s ease-in-out infinite reverse`,
          opacity: 0.38,
        }}
      />

      {/* Accent: teal wisp — bottom-left */}
      <Box
        sx={{
          ...blobBase,
          width: '28vw',
          height: '28vw',
          bottom: '10vh',
          left: '5vw',
          background: 'radial-gradient(circle, #0a7a6e 0%, #024040 55%, transparent 72%)',
          animation: `${drift1} 65s ease-in-out infinite reverse`,
          opacity: 0.32,
        }}
      />

      {/* Thin vignette overlay to anchor content */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,16,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
