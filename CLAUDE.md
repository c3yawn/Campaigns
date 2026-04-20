# The Yawniverse — Claude Session Context

## What This Is
A personal TTRPG campaign tracker for the user (last name: Yawn). Branded "The Yawniverse" / "Campaign Codex". Displays all campaigns grouped by game system as cards, routes to individual campaign detail pages. Hosted on GitHub Pages.

---

## Stack
- **React 18** + **Vite** (JavaScript, not TypeScript)
- **MUI v5** + Emotion
- **React Router v6** — `BrowserRouter` with `basename={import.meta.env.BASE_URL}`
- **Google Fonts** — Raleway (body) + Cinzel (display headings)
- Deployed via **GitHub Actions** → **GitHub Pages** at `c3yawn.github.io/Campaigns`

---

## Repo & Branch Setup
- **Repo**: `c3yawn/Campaigns`
- **Feature branch**: `claude/ttrpg-tracker-planning-OeN3Y`
- **Production branch**: `main` (GitHub Pages deploys from here)
- Always develop on the feature branch, push to both:
  ```
  git push origin claude/ttrpg-tracker-planning-OeN3Y
  git push origin HEAD:main
  ```

---

## Deployment Notes
- `vite.config.js` sets `base: process.env.VITE_BASE_PATH ?? '/'`
- CI sets `VITE_BASE_PATH=/Campaigns/` so assets resolve correctly under the sub-path
- `cp dist/index.html dist/404.html` in CI handles SPA deep-link routing on GitHub Pages
- Static assets (video, images) in `public/` must use `${import.meta.env.BASE_URL}filename` — **not** `/filename` — or they 404 on GitHub Pages
- Workflow: `.github/workflows/deploy.yml`

---

## Project Structure
```
src/
  data/campaigns.js          # Single source of truth — add campaigns here
  theme/theme.js             # MUI dark galaxy theme
  components/
    NebulaBackground.jsx     # Full-screen fixed video background
    CampaignCard.jsx         # Card per campaign
    SystemSection.jsx        # Section per TTRPG system
  pages/
    Home.jsx                 # Landing page
    CampaignPage.jsx         # Campaign detail (placeholder — see Future Plans)
  App.jsx                    # Routes: / and /campaign/:systemId/:campaignId
  main.jsx                   # ThemeProvider + BrowserRouter root
public/
  nebula.mp4                 # Animated nebula background video (21MB)
  images/campaigns/          # Campaign art goes here (jpg/png/webp)
```

---

## Data Shape (`src/data/campaigns.js`)
```js
export const systems = [
  {
    id: 'dnd5e',
    name: 'Dungeons & Dragons 5th Edition',
    campaigns: [
      {
        id: 'curse-of-strahd',
        title: 'Curse of Strahd',
        image: '/images/campaigns/strahd.jpg',  // or '' for gradient placeholder
        description: '...',
        status: 'Active',           // 'Active' | 'On Hiatus' | 'Completed'
        playerCharacters: ['Aela', 'Brother Tormund', 'Zara Nightwhisper'],
      },
    ],
  },
];
```
Current systems: D&D 5e (3 campaigns), Shadowrun 6e (2), Stars Without Number (2).

---

## Design System & Aesthetic
**Vibe**: Dark, sleek, space-themed. Elegant, not gaudy. Think galaxy observatory meets TTRPG archive.

**Palette**:
- Background: `#020208` (near-black)
- Primary: `#7c3aed` (deep purple)
- Secondary: `#0ea5e9` (sky blue)
- Cards: `rgba(6, 4, 20, 0.88)` glassmorphism with `backdropFilter: blur(20px)`
- Text primary: `#e2e8f0`, secondary: `#64748b`

**Typography**:
- **Cinzel** (serif) — hero title "Campaign Codex", navbar "The Yawniverse", display-only
- **Raleway** (sans) — everything else
- Hero title: gradient `#e2c9ff → #c084fc → #818cf8`, `filter: drop-shadow` purple glow
- Card titles: gradient `#f1f5f9 → #c084fc`
- System section headers: overline + gradient fade-line rule (no plain Divider)

**Cards**:
- Glassmorphism, `border: 1px solid rgba(124, 58, 237, 0.12)`
- Hover: purple/blue glow `box-shadow` + `translateY(-3px)`
- Placeholder image area: layered radial gradients (purple/blue/teal)
- Status chips: green=Active, amber=On Hiatus, grey=Completed

**Background**:
- `public/nebula.mp4` — native `<video autoPlay loop muted playsInline>` (not Box component="video", not GIF)
- Overlay gradient darkens top/bottom edges for readability

---

## User Preferences (remember these)
- Sleek, modern, dark — not gaudy or busy
- Space/galaxy aesthetic throughout
- Prefers to see changes on GitHub Pages (browser-based Claude Code, not CLI)
- Uploads binary files (images, video) via GitHub web UI, then asks Claude to pull and move to correct location
- Does not want unnecessary comments in code

---

## Future Plans (not yet built)
1. **Campaign detail pages** — `CampaignPage.jsx` is a placeholder. Planned content:
   - Session logs / recap entries
   - Lore notes
   - NPC tracker
   - Party info / character sheets summary
2. **Campaign images** — `image` field exists in data, `CardMedia` already handles it. Just needs art dropped into `public/images/campaigns/` and path set in `campaigns.js`
3. **More systems/campaigns** — user will add real campaigns over time; just edit `campaigns.js`
4. **Possibly**: search/filter by status, tags per campaign, maybe a map or timeline view

---

## Key Decisions & Gotchas
- Use `import.meta.env.BASE_URL` (not `/`) for all `public/` asset paths — critical for GitHub Pages
- Use native `<video>` element, not MUI `Box component="video"` — muted/autoPlay don't forward reliably
- Binary file workflow: user uploads to GitHub root via web UI → Claude pulls, moves to `public/`, commits
- GitHub Pages environment blocks workflow-level env vars from the deploy job — must set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` on the deploy job directly too
- `cp dist/index.html dist/404.html` must stay in the workflow for React Router deep links to work
