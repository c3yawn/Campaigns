import { keyframes } from '@emotion/react';
import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';

const trophyGlow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 3px rgba(251,191,36,0.7)) drop-shadow(0 0 7px rgba(251,191,36,0.3)); }
  50%       { filter: drop-shadow(0 0 7px rgba(251,191,36,1.0)) drop-shadow(0 0 14px rgba(251,191,36,0.55)); }
`;
import NebulaBackground from '../components/NebulaBackground';
import { useSteamTracker } from '../hooks/useSteamTracker';

const STATUS = {
  in_progress: { label: 'Playing Now', bg: 'rgba(14,165,233,0.12)',  color: '#0ea5e9', border: 'rgba(14,165,233,0.3)'  },
  queue:       { label: 'Up Next',     bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
  completed:   { label: 'Completed',   bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)'  },
};

const TABS = ['all', 'playing', 'queue', 'completed'];
const TAB_LABELS = ['All', 'Playing Now', 'Up Next', 'Completed'];

function iconUrl(appId, hash) {
  if (!hash) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
}

function GameIcon({ appId, hash }) {
  const [errored, setErrored] = useState(false);
  if (!hash || errored) {
    return (
      <Box sx={{
        width: 32, height: 32, borderRadius: '4px', flexShrink: 0,
        background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.12)',
      }} />
    );
  }
  return (
    <Box
      component="img"
      src={iconUrl(appId, hash)}
      onError={() => setErrored(true)}
      sx={{ width: 32, height: 32, borderRadius: '4px', flexShrink: 0, display: 'block' }}
    />
  );
}

function StatusChip({ statusKey }) {
  const s = STATUS[statusKey];
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ fontSize: '0.6rem', height: 20, bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    />
  );
}

function ActionChip({ label, color, onClick }) {
  const c = STATUS[color] ?? STATUS.in_progress;
  return (
    <Chip
      label={label}
      size="small"
      onClick={onClick}
      sx={{
        fontSize: '0.58rem', height: 18, cursor: 'pointer',
        bgcolor: 'transparent', color: c.color.replace(')', ', 0.55)').replace('rgb', 'rgba'),
        border: `1px solid ${c.border}`,
        transition: 'all 0.15s',
        '&:hover': { bgcolor: c.bg, color: c.color },
      }}
    />
  );
}

export default function SteamTrackerPage() {
  const { games, loadingLibrary, achProgress, error, setStatus, refresh } = useSteamTracker();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => ({
    completed: games.filter(g => g.completed).length,
    playing:   games.filter(g => !g.completed && g.status === 'in_progress').length,
    queue:     games.filter(g => g.status === 'queue').length,
  }), [games]);

  const filteredGames = useMemo(() => {
    let list = games;
    if (tab === 'playing')   list = games.filter(g => !g.completed && g.status === 'in_progress');
    else if (tab === 'queue') list = games.filter(g => g.status === 'queue');
    else if (tab === 'completed') list = games.filter(g => g.completed);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g => g.name?.toLowerCase().includes(q));
    }
    return list;
  }, [games, tab, search]);

  const achDone = achProgress.total > 0 && achProgress.loaded >= achProgress.total;
  const achPct = achProgress.total > 0 ? (achProgress.loaded / achProgress.total) * 100 : 0;

  return (
    <>
      <NebulaBackground />

      <Container maxWidth="xl" sx={{ py: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: '"Uncial Antiqua", serif',
              fontWeight: 400,
              mb: 1.5,
              background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 55%, #10b981 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.75rem', sm: '2.3rem', md: '2.75rem' },
              filter: 'drop-shadow(0 0 24px rgba(34,211,238,0.35))',
              letterSpacing: '0.02em',
            }}
          >
            Steam Achievement Tracker
          </Typography>
          <Typography sx={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.83rem', letterSpacing: '0.05em' }}>
            Track your journey to 100% completion
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { ...STATUS.completed,   label: 'Completed',   count: stats.completed },
            { ...STATUS.in_progress, label: 'Playing Now', count: stats.playing   },
            { ...STATUS.queue,       label: 'Up Next',     count: stats.queue     },
          ].map(({ label, count, bg, color, border }) => (
            <Box
              key={label}
              sx={{
                px: 3, py: 1.5,
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '10px',
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
                minWidth: 110,
              }}
            >
              <Typography sx={{ fontSize: '1.65rem', fontWeight: 700, color, lineHeight: 1 }}>
                {count}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.65)', letterSpacing: '0.1em', mt: 0.4, textTransform: 'uppercase' }}>
                {label}
              </Typography>
            </Box>
          ))}
          <Tooltip title="Refresh library & achievements">
            <IconButton
              onClick={refresh}
              size="small"
              sx={{
                color: 'rgba(148,163,184,0.3)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '10px',
                p: 1.25,
                '&:hover': { color: '#a78bfa', borderColor: 'rgba(167,139,250,0.35)', bgcolor: 'rgba(124,58,237,0.07)' },
              }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Achievement scan progress */}
        {achProgress.total > 0 && !achDone && (
          <Box sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.45)', letterSpacing: '0.05em' }}>
                Scanning achievements…
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.45)', fontVariantNumeric: 'tabular-nums' }}>
                {achProgress.loaded} / {achProgress.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={achPct}
              sx={{
                height: 3, borderRadius: 2,
                bgcolor: 'rgba(124,58,237,0.1)',
                '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #3b82f6, #22d3ee)', borderRadius: 2 },
              }}
            />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ mb: 3, p: 2, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#f87171' }}>{error}</Typography>
          </Box>
        )}

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 2, flexWrap: 'wrap' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                fontFamily: '"Raleway", sans-serif',
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '0.05em',
                textTransform: 'none',
                color: 'rgba(148,163,184,0.55)',
                minHeight: 36,
                py: 0.5,
                '&.Mui-selected': { color: '#22d3ee' },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#22d3ee',
                boxShadow: '0 0 8px rgba(34,211,238,0.5)',
              },
            }}
          >
            {TABS.map((t, i) => <Tab key={t} value={t} label={TAB_LABELS[i]} />)}
          </Tabs>

          <TextField
            size="small"
            placeholder="Search games…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 15, color: 'rgba(148,163,184,0.35)' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: 210,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.8rem',
                background: 'rgba(6,4,20,0.55)',
                borderRadius: '8px',
                '& fieldset': { borderColor: 'rgba(124,58,237,0.18)' },
                '&:hover fieldset': { borderColor: 'rgba(124,58,237,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#22d3ee' },
              },
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer
          sx={{
            background: 'rgba(6, 4, 20, 0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { label: 'Game',         sx: {} },
                  { label: 'Achievements', sx: { width: 120 } },
                  { label: 'Progress',     sx: { minWidth: 180 } },
                  { label: 'Status',       sx: { width: 240 } },
                ].map(({ label, sx }) => (
                  <TableCell
                    key={label}
                    sx={{
                      borderBottom: '1px solid rgba(124,58,237,0.12)',
                      color: 'rgba(148,163,184,0.45)',
                      fontSize: '0.62rem',
                      fontFamily: '"Raleway", sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      py: 1.5,
                      ...sx,
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingLibrary ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ border: 'none', py: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '4px', bgcolor: 'rgba(124,58,237,0.1)', flexShrink: 0 }} />
                        <Skeleton width={180} height={13} sx={{ bgcolor: 'rgba(124,58,237,0.1)' }} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ border: 'none' }}><Skeleton width={55} height={13} sx={{ bgcolor: 'rgba(124,58,237,0.1)' }} /></TableCell>
                    <TableCell sx={{ border: 'none' }}><Skeleton width={150} height={7} sx={{ bgcolor: 'rgba(124,58,237,0.1)', borderRadius: '4px' }} /></TableCell>
                    <TableCell sx={{ border: 'none' }} />
                  </TableRow>
                ))
              ) : filteredGames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ border: 'none', py: 7, textAlign: 'center' }}>
                    <Typography sx={{ color: 'rgba(148,163,184,0.35)', fontSize: '0.84rem' }}>
                      {games.length === 0 ? 'No games found. Check your Steam API configuration.' : 'No games match this filter.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGames.map((game) => {
                  const achLoading = game.ach === undefined;
                  const hasAch = game.ach != null;
                  const noAch = game.ach === null;

                  const barColor = game.completed
                    ? 'linear-gradient(90deg, #10b981, #22d3ee)'
                    : game.status === 'in_progress'
                    ? 'linear-gradient(90deg, #3b82f6, #22d3ee)'
                    : 'linear-gradient(90deg, #d97706, #f59e0b)';

                  return (
                    <TableRow
                      key={game.appid}
                      sx={{
                        '&:not(:last-child) td': { borderBottom: '1px solid rgba(124,58,237,0.07)' },
                        '&:last-child td': { border: 'none' },
                        '&:hover': { background: 'rgba(124,58,237,0.04)' },
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Game */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <GameIcon appId={game.appid} hash={game.img_icon_url} />
                          {game.completed && (
                            <EmojiEventsIcon sx={{
                              fontSize: 15,
                              color: '#fbbf24',
                              flexShrink: 0,
                              animation: `${trophyGlow} 2.2s ease-in-out infinite`,
                            }} />
                          )}
                          <Typography sx={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                            {game.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Achievement count */}
                      <TableCell sx={{ py: 1.5 }}>
                        {achLoading ? (
                          <Skeleton width={50} height={13} sx={{ bgcolor: 'rgba(124,58,237,0.1)' }} />
                        ) : noAch ? (
                          <Typography sx={{ fontSize: '0.73rem', color: 'rgba(148,163,184,0.3)' }}>—</Typography>
                        ) : (
                          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.65)', fontVariantNumeric: 'tabular-nums' }}>
                            {game.ach.achieved} / {game.ach.total}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Progress bar */}
                      <TableCell sx={{ py: 1.5 }}>
                        {achLoading ? (
                          <Skeleton width={150} height={7} sx={{ bgcolor: 'rgba(124,58,237,0.1)', borderRadius: '4px' }} />
                        ) : noAch ? (
                          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.22)' }}>No achievements</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={game.pct}
                              sx={{
                                flex: 1, height: 6, borderRadius: 3,
                                bgcolor: 'rgba(124,58,237,0.12)',
                                '& .MuiLinearProgress-bar': { borderRadius: 3, background: barColor },
                              }}
                            />
                            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.55)', minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                              {game.pct}%
                            </Typography>
                          </Box>
                        )}
                      </TableCell>

                      {/* Status + actions */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                          {game.completed ? (
                            <StatusChip statusKey="completed" />
                          ) : game.status === 'in_progress' ? (
                            <>
                              <StatusChip statusKey="in_progress" />
                              <ActionChip label="→ Up Next" color="queue" onClick={() => setStatus(game.appid, 'queue', game.name, game.img_icon_url)} />
                              <Tooltip title="Remove">
                                <IconButton
                                  size="small"
                                  onClick={() => setStatus(game.appid, null, game.name, game.img_icon_url)}
                                  sx={{ color: 'rgba(148,163,184,0.25)', p: 0.25, '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}
                                >
                                  <CloseIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : game.status === 'queue' ? (
                            <>
                              <StatusChip statusKey="queue" />
                              <ActionChip label="▶ Start" color="in_progress" onClick={() => setStatus(game.appid, 'in_progress', game.name, game.img_icon_url)} />
                              <Tooltip title="Remove">
                                <IconButton
                                  size="small"
                                  onClick={() => setStatus(game.appid, null, game.name, game.img_icon_url)}
                                  sx={{ color: 'rgba(148,163,184,0.25)', p: 0.25, '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}
                                >
                                  <CloseIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <ActionChip label="▶ Playing Now" color="in_progress" onClick={() => setStatus(game.appid, 'in_progress', game.name, game.img_icon_url)} />
                              <ActionChip label="+ Up Next" color="queue" onClick={() => setStatus(game.appid, 'queue', game.name, game.img_icon_url)} />
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
