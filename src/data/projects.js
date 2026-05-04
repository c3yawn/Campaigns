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
    id: 'arcadia',
    title: 'Arcadia',
    description:
      'A creature adoption and collection game set across four alien worlds. Send expeditions into classified biomes, discover creatures found nowhere else in charted space, and build your Vivarium.',
    status: 'In Development',
    path: '/arcadia',
    image: '',
    gradient: 'linear-gradient(135deg, #0d9488, #7c3aed, #f59e0b)',
    glow: 'rgba(13, 148, 136, 0.35)',
  },
  {
    id: 'game',
    title: 'Dark Embers RPG',
    hidden: true,
    description:
      'A village burns. One man stands against a force that\'s already won. The lone survivor carries it forward, into a world reshaped by conquest, where what rises from the ashes decides what\'s left to take back.',
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
      'A personal 100% completion tracker for the Steam library. Queue games, track in-progress achievement hunts, and log completed runs, all in one place.',
    status: 'Active',
    path: '/steam',
    image: `${import.meta.env.BASE_URL}images/steamtracker.png`,
    gradient: 'linear-gradient(135deg, #22d3ee, #3b82f6, #10b981)',
    glow: 'rgba(34, 211, 238, 0.3)',
  },
];
