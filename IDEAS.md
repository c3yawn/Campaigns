# Yawniverse — Running Ideas Log

A living document of ideas mentioned in conversation, for future reference.

---

## The Creature Game (working title)

### Theme
- **Undecided** between real animals and fantasy/sci-fi creatures
- Both are on the table — keep both in mind until a final call is made
- If fantasy/sci-fi: creatures could be space fauna, void beasts, nebula animals, etc.
- Could potentially mix both (real animals + fantasy variants or rare mutations)

### World Structure
- **"The Wild"** — the main world players explore to find and catch creatures
- Divided into **Biomes**, each with different species available
- Future: **Event Biomes** — limited-time special biomes with exclusive species
- Future (fantasy/sci-fi theme): **Worlds / Planets / Universes** as the top-level structure, with biomes inside each

### Cross-Breeds
- Specific pairings of two species produce a unique hybrid offspring
- Example concept: Gorilla + Cat = "Gorecat"
- Hybrids are not findable in the wild — breeding only
- Worth keeping regardless of theme (works for real animals and fantasy alike)

### Core Game Loop (planned)
1. Travel to a Biome in The Wild → find and catch creatures (eggs or young animals)
2. Raise them through lifecycle stages (egg → hatchling → adult), time-gated
3. Build a personal stable/collection
4. Breed adults to produce offspring and cross-breeds
5. Trade/gift creatures with other players
6. View full lineage trees for any creature

### Multiplayer Features (planned)
- Trading system (two-sided offers)
- Gifting via shareable link tokens
- Abandoned pool — released creatures others can claim
- Shared view/click system to help each other raise creatures

### Growth Mechanic
- Creatures need views/clicks from other players to grow (like Dragon Cave)
- Too few views before deadline = creature dies
- Players are authenticated, so unique views tracked by user ID (not IP)

### Special / Event Ideas
- Holiday or seasonal event biomes with exclusive species
- Limited-time species with per-player catch limits (like Dragon Cave's holiday cap)
- Possibly: alternate color variants of species at low probability

### Tech Stack
- React 19 + Vite, MUI v9, inside the Yawniverse site (`/creatures` route)
- Supabase for auth + database
- Pixel sprites for creature art

---

## Notes on Things NOT to Do
- No paywalls or pay-to-win mechanics
- Keep scarcity emergent (time limits, breeding odds, rarity tiers) not artificial

---

*Last updated: 2026-05-01*
