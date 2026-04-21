# Project Card Visual Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add star field, glow pulse, and shimmer sweep effects to `ProjectCard.jsx` so hub cards feel like portholes into space.

**Architecture:** Single-file change. Three pure-CSS effects layered on the existing MUI Card: a twinkling star field (`Box` with 35 positioned divs behind content), a breathing `box-shadow` animation at idle, and a shimmer `::after` sweep on hover. All keyframes defined via `@emotion/react`'s `keyframes` helper and referenced in MUI `sx` props.

**Tech Stack:** React 19, MUI v9, Emotion (`@emotion/react` is already a transitive dep of MUI — no install needed)

---

### Task 1: Add keyframes and star data constants

**Files:**
- Modify: `src/components/ProjectCard.jsx` (top of file, before the component)

- [ ] **Step 1: Add the `keyframes` import and three animation definitions**

Open `src/components/ProjectCard.jsx` and replace the first line with:

```jsx
import { keyframes } from '@emotion/react';
import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
```

Then add these constants directly after the `STATUS_COLORS` object:

```jsx
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
```

- [ ] **Step 2: Commit the constants**

```bash
git add src/components/ProjectCard.jsx
git commit -m "feat: add star/animation constants to ProjectCard"
```

---

### Task 2: Update Card sx for pulse + shimmer

**Files:**
- Modify: `src/components/ProjectCard.jsx` — the `<Card>` component's `sx` prop

- [ ] **Step 1: Replace the Card's `sx` prop**

Find the `<Card sx={{ ... }}>` block (lines 15–28 of the original) and replace it with:

```jsx
<Card
  sx={{
    background: 'rgba(6, 4, 20, 0.88)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(124, 58, 237, 0.12)',
    borderRadius: '14px',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    animation: `${pulseGlow} 3s ease-in-out infinite`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 40px ${project.glow}, 0 0 0 1px rgba(124,58,237,0.2)`,
      animation: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '60%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      pointerEvents: 'none',
      zIndex: 3,
    },
    '&:hover::after': {
      animation: `${shimmer} 0.5s ease forwards`,
    },
  }}
>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProjectCard.jsx
git commit -m "feat: add glow pulse and shimmer sweep to ProjectCard"
```

---

### Task 3: Add starfield markup and fix z-index layering

**Files:**
- Modify: `src/components/ProjectCard.jsx` — JSX inside `<CardActionArea>`

- [ ] **Step 1: Add the starfield Box as the first child of `CardActionArea`**

Inside `<CardActionArea>`, before the accent bar `<Box>`, add:

```jsx
<Box
  sx={{
    position: 'absolute',
    inset: 0,
    borderRadius: '14px',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  }}
>
  {STARS.map((s, i) => (
    <Box
      key={i}
      sx={{
        position: 'absolute',
        width: s.w,
        height: s.w,
        top: s.top,
        left: s.left,
        background: 'white',
        borderRadius: '50%',
        animation: `${twinkle} ${s.dur} ease-in-out infinite ${s.delay}`,
        opacity: s.op,
        '--base-op': s.op,
      }}
    />
  ))}
</Box>
```

- [ ] **Step 2: Add `position: relative` and `zIndex: 1` to the accent bar Box**

Find the accent bar `<Box sx={{ height: '3px', ... }}>` and add `position: 'relative'` and `zIndex: 1` to its `sx`:

```jsx
<Box
  sx={{
    height: '3px',
    background: project.gradient,
    borderRadius: '14px 14px 0 0',
    filter: `drop-shadow(0 0 8px ${project.glow})`,
    position: 'relative',
    zIndex: 1,
  }}
/>
```

- [ ] **Step 3: Add `position: relative` and `zIndex: 1` to `CardContent`**

```jsx
<CardContent sx={{ p: 3, pb: '20px !important', position: 'relative', zIndex: 1 }}>
```

- [ ] **Step 4: Verify visually**

Run `npm run dev` and open `http://localhost:5173`. Check:
- Stars twinkle behind card content at rest
- Card glows softly and pulses
- Hovering lifts the card and triggers the shimmer sweep
- Card text and chips render above the stars (not obscured)

- [ ] **Step 5: Commit and push**

```bash
git add src/components/ProjectCard.jsx
git commit -m "feat: add star field to ProjectCard with correct z-index layering"
git push origin claude/install-superpowers-plugin-5pAA8
git push origin HEAD:main
```
