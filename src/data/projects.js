export const projects = [
  {
    id: 'campaigns',
    title: 'Campaign Codex',
    description:
      'A living archive of my tabletop RPG Campaigns across multiple systems. Tracks sessions, players, lore, NPCs, and party records across my campaigns and systems.',
    status: 'Active',
    path: '/campaigns',
    image: `${import.meta.env.BASE_URL}images/lorebook.png`,
    gradient: 'linear-gradient(135deg, #a78bfa, #38bdf8, #2dd4bf)',
    glow: 'rgba(56, 189, 248, 0.3)',
  },
  {
    id: 'game',
    title: 'Dark Embers RPG',
    description:
      'A village burns, and in its final moments, one man stands against a force that has already claimed everything. From the ashes, a lone survivor is left to carry that moment forward into a world reshaped by conquest, where loss is only the beginning, and what rises from it will decide what\'s left to take back.',
    status: 'In Development',
    path: '/game',
    image: `${import.meta.env.BASE_URL}images/rpgcard.png`,
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444, #7c3aed)',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'steam',
    title: 'Steam Achievement Tracker',
    description:
      'A personal 100% completion tracker for the Steam library. Queue games, track in-progress achievement hunts, and log completed runs — all in one place.',
    status: 'Active',
    path: '/steam',
    image: `${import.meta.env.BASE_URL}images/steamtracker.png`,
    gradient: 'linear-gradient(135deg, #22d3ee, #3b82f6, #10b981)',
    glow: 'rgba(34, 211, 238, 0.3)',
  },
];
