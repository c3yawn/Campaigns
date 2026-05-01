# The Yawniverse — Claude Session Context

## Interaction Rules
- **Always use the `AskUserQuestion` tool when asking the user questions.** Never ask questions as plain text.

---

## What This Is
A personal TTRPG campaign tracker for the user (last name: Yawn). Branded "The Yawniverse" / "Campaign Codex". Displays all campaigns grouped by game system as cards, routes to individual campaign detail pages. Hosted on GitHub Pages.

---

## Stack
- **React 19** + **Vite 8** (JavaScript, not TypeScript)
- **MUI v9** + Emotion
- **React Router v7** — `BrowserRouter` with `basename={import.meta.env.BASE_URL}`
- **Google Fonts** — Uncial Antiqua (hero title) + Cinzel (display) + Raleway (body, italic axis loaded)
- Deployed via **GitHub Actions** → **GitHub Pages** at `c3yawn.github.io/Yawniverse`

---

## Repo & Branch Setup
- **Repo**: `c3yawn/Yawniverse`
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
- CI sets `VITE_BASE_PATH=/Yawniverse/` so assets resolve correctly under the sub-path
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
Current systems array order: **Stars Without Number** (2), **D&D 5e** (3), **Shadowrun 6e** (2). Array order = tab display order.

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
- **Uncial Antiqua** (serif) — hero title "The Infinite Archive" only (single-weight, display-only)
- **Cinzel** (serif) — navbar "The Yawniverse" and quote attribution
- **Raleway** (sans) — everything else, including quote body text (italic weight loaded)
- Hero title: gradient `#e2c9ff → #c084fc → #818cf8`, `filter: drop-shadow` purple glow
- Card titles: gradient `#f1f5f9 → #c084fc`
- System names: **tab bar** in `Home.jsx` (not headers in SystemSection — those were removed)
- Tab bar: Cinzel, 0.68rem, centered (`width: fit-content`, `mx: auto`), bottom border spans only tab width
- Tab gradients: SWN = `#a78bfa→#38bdf8→#2dd4bf`, D&D = `#d4af37→#8b1c2a`, Shadowrun = `#ff6eb4→#a855f7→#22d3ee`
- Tab states: inactive = 0.78 opacity + subtle neutral glow; active = 1.0 opacity + color-matched `drop-shadow` glow + `::after` underline

**Cards**:
- Glassmorphism, `border: 1px solid rgba(124, 58, 237, 0.12)`
- Hover: purple/blue glow `box-shadow` + `translateY(-3px)`
- Placeholder image area: layered radial gradients (purple/blue/teal)
- Status chips: green=Active, amber=On Hiatus, grey=Completed
- Equal-width columns (`size={{ xs: 12, sm: 6, md: 4 }}` MUI v9 API), centered (`justifyContent: center`), auto-height (no `height: '100%'`)

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
- MUI v9 Grid API: use `size={{ xs, sm, md }}` on items — legacy `item xs sm md` props are removed
- `SYSTEM_GRADIENTS` in `Home.jsx` maps system IDs to gradient configs — add an entry here whenever a new system is added to `campaigns.js` or the page will fall back to `DEFAULT_GRADIENT`
- `useState(systems[0].id)` drives active tab — array order in `campaigns.js` determines the default
