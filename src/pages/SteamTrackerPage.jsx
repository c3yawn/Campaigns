import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
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
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import NebulaBackground from '../components/NebulaBackground';
import { useSteamTracker } from '../hooks/useSteamTracker';

const STATUS = {
  queue:       { label: 'Queue',       bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
  in_progress: { label: 'In Progress', bg: 'rgba(14,165,233,0.12)',  color: '#0ea5e9', border: 'rgba(14,165,233,0.3)'  },
  completed:   { label: 'Completed',   bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)'  },
};

const TABS = ['all', 'in_progress', 'queue', 'completed'];
const TAB_LABELS = ['All', 'In Progress', 'Queue', 'Completed'];

function iconUrl(appId, hash) {
  if (!hash) return null;
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
}

function GameIcon({ appId, hash, size = 32 }) {
  const [errored, setErrored] = useState(false);
  if (!hash || errored) {
    return (
      <Box sx={{
        width: size, height: size, borderRadius: '4px', flexShrink: 0,
        background: 'rgba(124,58,237,0.15)',
        border: '1px solid rgba(124,58,237,0.15)',
      }} />
    );
  }
  return (
    <Box
      component="img"
      src={iconUrl(appId, hash)}
      onError={() => setErrored(true)}
      sx={{ width: size, height: size, borderRadius: '4px', flexShrink: 0, display: 'block' }}
    />
  );
}

export default function SteamTrackerPage() {
  const { games, library, loadingTracked, loadingLibrary, loadingAchievements, loadLibrary, addGame, updateStatus, removeGame } =
    useSteamTracker();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [libSearch, setLibSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const libSearchRef = useRef(null);

  const stats = useMemo(() => ({
    completed:   games.filter((g) => g.completed).length,
    in_progress: games.filter((g) => !g.completed && g.status === 'in_progress').length,
    queue:       games.filter((g) => g.status === 'queue').length,
  }), [games]);

  const filteredGames = useMemo(() => {
    let list = [...games];
    if (tab === 'completed')   list = games.filter((g) => g.completed);
    else if (tab === 'in_progress') list = games.filter((g) => !g.completed && g.status === 'in_progress');
    else if (tab === 'queue')  list = games.filter((g) => g.status === 'queue');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.game_name?.toLowerCase().includes(q));
    }
    return list;
  }, [games, tab, search]);

  const trackedIds = useMemo(() => new Set(games.map((g) => g.app_id)), [games]);
  const filteredLibrary = useMemo(() => {
    const base = library.filter((g) => !trackedIds.has(g.appid));
    if (!libSearch.trim()) return base;
    const q = libSearch.toLowerCase();
    return base.filter((g) => g.name.toLowerCase().includes(q));
  }, [library, libSearch, trackedIds]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    loadLibrary();
    setTimeout(() => libSearchRef.current?.focus(), 100);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setLibSearch('');
  };

  const handleAddGame = async (game, status) => {
    setAddingId(game.appid);
    try {
      await addGame(game.appid, game.name, status, game.img_icon_url);
      handleCloseDialog();
    } finally {
      setAddingId(null);
    }
  };

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
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 5, flexWrap: 'wrap' }}>
          {[
            { ...STATUS.completed,   label: 'Completed',   count: stats.completed   },
            { ...STATUS.in_progress, label: 'In Progress', count: stats.in_progress },
            { ...STATUS.queue,       label: 'Queued',      count: stats.queue       },
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
        </Box>

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

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search tracked games…"
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
            <Button
              startIcon={<AddIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleOpenDialog}
              variant="outlined"
              size="small"
              sx={{
                fontFamily: '"Raleway", sans-serif',
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '0.05em',
                textTransform: 'none',
                color: '#22d3ee',
                borderColor: 'rgba(34,211,238,0.35)',
                borderRadius: '8px',
                px: 2,
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: '#22d3ee', background: 'rgba(34,211,238,0.07)' },
              }}
            >
              Track Game
            </Button>
          </Box>
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
                  { label: 'Status',       sx: { width: 200 } },
                  { label: '',             sx: { width: 44, px: 1 } },
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
              {loadingTracked ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ border: 'none', py: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '4px', bgcolor: 'rgba(124,58,237,0.1)', flexShrink: 0 }} />
                        <Skeleton width={180} height={13} sx={{ bgcolor: 'rgba(124,58,237,0.1)' }} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ border: 'none' }}><Skeleton width={55} height={13} sx={{ bgcolor: 'rgba(124,58,237,0.1)' }} /></TableCell>
                    <TableCell sx={{ border: 'none' }}><Skeleton width={150} height={7} sx={{ bgcolor: 'rgba(124,58,237,0.1)', borderRadius: '4px' }} /></TableCell>
                    <TableCell sx={{ border: 'none' }}><Skeleton width={85} height={20} sx={{ bgcolor: 'rgba(124,58,237,0.1)', borderRadius: '10px' }} /></TableCell>
                    <TableCell sx={{ border: 'none' }} />
                  </TableRow>
                ))
              ) : filteredGames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ border: 'none', py: 7, textAlign: 'center' }}>
                    <Typography sx={{ color: 'rgba(148,163,184,0.35)', fontSize: '0.84rem' }}>
                      {games.length === 0
                        ? 'No games tracked yet — click "Track Game" to get started.'
                        : 'No games match this filter.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGames.map((game) => {
                  const statusKey = game.completed ? 'completed' : game.status;
                  const s = STATUS[statusKey];
                  const achLoaded = game.app_id in (game.achievements !== undefined ? { [game.app_id]: true } : {});
                  const hasAch = game.achievements != null;
                  const noAch = game.achievements === null;
                  const achPending = game.achievements === undefined && loadingAchievements;

                  return (
                    <TableRow
                      key={game.app_id}
                      sx={{
                        '&:not(:last-child) td': { borderBottom: '1px solid rgba(124,58,237,0.07)' },
                        '&:last-child td': { border: 'none' },
                        '&:hover': { background: 'rgba(124,58,237,0.04)' },
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Game name + icon */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <GameIcon appId={game.app_id} hash={game.img_icon_url} />
                          <Typography sx={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                            {game.game_name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Achievements count */}
                      <TableCell sx={{ py: 1.5 }}>
                        {achPending ? (
                          <Skeleton width={50} height={13} sx={{ bgcolor: 'rgba(124,58,237,0.1)' }} />
                        ) : noAch ? (
                          <Typography sx={{ fontSize: '0.73rem', color: 'rgba(148,163,184,0.35)' }}>—</Typography>
                        ) : hasAch ? (
                          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(148,163,184,0.65)', fontVariantNumeric: 'tabular-nums' }}>
                            {game.achievements.achieved} / {game.achievements.total}
                          </Typography>
                        ) : null}
                      </TableCell>

                      {/* Progress bar */}
                      <TableCell sx={{ py: 1.5 }}>
                        {achPending ? (
                          <Skeleton width={150} height={7} sx={{ bgcolor: 'rgba(124,58,237,0.1)', borderRadius: '4px' }} />
                        ) : noAch ? (
                          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.28)' }}>No achievements</Typography>
                        ) : hasAch ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={game.pct}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(124,58,237,0.12)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: game.completed
                                    ? 'linear-gradient(90deg, #10b981, #22d3ee)'
                                    : game.status === 'in_progress'
                                    ? 'linear-gradient(90deg, #3b82f6, #22d3ee)'
                                    : 'linear-gradient(90deg, #d97706, #f59e0b)',
                                },
                              }}
                            />
                            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.55)', minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                              {game.pct}%
                            </Typography>
                          </Box>
                        ) : null}
                      </TableCell>

                      {/* Status chip + move actions */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={s.label}
                            size="small"
                            sx={{ fontSize: '0.6rem', height: 20, bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                          />
                          {!game.completed && game.status === 'queue' && (
                            <Tooltip title="Move to In Progress">
                              <Chip
                                label="Start →"
                                size="small"
                                onClick={() => updateStatus(game.app_id, 'in_progress')}
                                sx={{
                                  fontSize: '0.58rem', height: 18, cursor: 'pointer',
                                  bgcolor: 'rgba(14,165,233,0.08)', color: 'rgba(14,165,233,0.65)', border: '1px solid rgba(14,165,233,0.18)',
                                  '&:hover': { bgcolor: 'rgba(14,165,233,0.16)', color: '#0ea5e9' },
                                }}
                              />
                            </Tooltip>
                          )}
                          {!game.completed && game.status === 'in_progress' && (
                            <Tooltip title="Move back to Queue">
                              <Chip
                                label="← Queue"
                                size="small"
                                onClick={() => updateStatus(game.app_id, 'queue')}
                                sx={{
                                  fontSize: '0.58rem', height: 18, cursor: 'pointer',
                                  bgcolor: 'rgba(245,158,11,0.08)', color: 'rgba(245,158,11,0.65)', border: '1px solid rgba(245,158,11,0.18)',
                                  '&:hover': { bgcolor: 'rgba(245,158,11,0.16)', color: '#f59e0b' },
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {/* Remove */}
                      <TableCell sx={{ py: 1.5, px: 1 }}>
                        <Tooltip title="Remove from tracker">
                          <IconButton
                            size="small"
                            onClick={() => removeGame(game.app_id)}
                            sx={{ color: 'rgba(148,163,184,0.25)', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Add Game Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(6, 4, 20, 0.97)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(124,58,237,0.18)',
            borderRadius: '14px',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
          <Typography sx={{ fontFamily: '"Cinzel", serif', fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.06em' }}>
            Track a Game
          </Typography>
          <IconButton size="small" onClick={handleCloseDialog} sx={{ color: 'rgba(148,163,184,0.4)', '&:hover': { color: '#e2e8f0' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search your Steam library…"
            value={libSearch}
            onChange={(e) => setLibSearch(e.target.value)}
            inputRef={libSearchRef}
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
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.82rem',
                background: 'rgba(124,58,237,0.05)',
                borderRadius: '8px',
                '& fieldset': { borderColor: 'rgba(124,58,237,0.18)' },
                '&:hover fieldset': { borderColor: 'rgba(124,58,237,0.35)' },
                '&.Mui-focused fieldset': { borderColor: '#22d3ee' },
              },
            }}
          />

          {loadingLibrary ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, py: 2 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', px: 1 }}>
                  <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '4px', bgcolor: 'rgba(124,58,237,0.1)', flexShrink: 0 }} />
                  <Skeleton width={Math.random() * 80 + 120} height={13} sx={{ bgcolor: 'rgba(124,58,237,0.1)' }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.25,
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(124,58,237,0.25)', borderRadius: '2px' },
            }}>
              {filteredLibrary.length === 0 ? (
                <Typography sx={{ color: 'rgba(148,163,184,0.35)', fontSize: '0.82rem', textAlign: 'center', py: 5 }}>
                  {library.length === 0
                    ? 'Could not load library. Check your Steam API configuration.'
                    : 'No untracked games match your search.'}
                </Typography>
              ) : filteredLibrary.map((game) => (
                <Box
                  key={game.appid}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.9,
                    borderRadius: '8px',
                    '&:hover': { background: 'rgba(124,58,237,0.07)' },
                    transition: 'background 0.12s',
                  }}
                >
                  <GameIcon appId={game.appid} hash={game.img_icon_url} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {game.name}
                    </Typography>
                    {game.playtime_forever > 0 && (
                      <Typography sx={{ fontSize: '0.67rem', color: 'rgba(148,163,184,0.4)' }}>
                        {Math.round(game.playtime_forever / 60)}h played
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                    <Chip
                      label="Queue"
                      size="small"
                      onClick={() => handleAddGame(game, 'queue')}
                      disabled={addingId === game.appid}
                      sx={{
                        fontSize: '0.6rem', height: 20, cursor: 'pointer',
                        bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)',
                        '&:hover': { bgcolor: 'rgba(245,158,11,0.2)' },
                        '&.Mui-disabled': { opacity: 0.4 },
                      }}
                    />
                    <Chip
                      label="In Progress"
                      size="small"
                      onClick={() => handleAddGame(game, 'in_progress')}
                      disabled={addingId === game.appid}
                      sx={{
                        fontSize: '0.6rem', height: 20, cursor: 'pointer',
                        bgcolor: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.25)',
                        '&:hover': { bgcolor: 'rgba(14,165,233,0.2)' },
                        '&.Mui-disabled': { opacity: 0.4 },
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
