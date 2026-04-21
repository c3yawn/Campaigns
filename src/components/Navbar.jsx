import { useState } from 'react';
import { AppBar, Avatar, Box, Button, Divider, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignInModal from './SignInModal';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [signInOpen, setSignInOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const showAuth = location.pathname !== '/';

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const avatarSrc = user?.user_metadata?.avatar_url ?? undefined;

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography
            variant="subtitle2"
            component="span"
            onClick={!showAuth ? undefined : () => navigate('/')}
            sx={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#a78bfa',
              fontSize: '0.72rem',
              textShadow: '0 0 20px rgba(167, 139, 250, 0.5)',
              flexGrow: 1,
              cursor: showAuth ? 'pointer' : 'default',
            }}
          >
            The Yawniverse
          </Typography>

          {showAuth && (user ? (
            <>
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ p: 0.5 }}
              >
                <Avatar
                  src={avatarSrc}
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.75rem',
                    fontFamily: '"Raleway", sans-serif',
                    fontWeight: 700,
                    bgcolor: '#7c3aed',
                    border: '1px solid rgba(167,139,250,0.4)',
                  }}
                >
                  {!avatarSrc && initials}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    background: 'rgba(6, 4, 20, 0.97)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    borderRadius: '10px',
                    minWidth: 200,
                    mt: 0.5,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important', pb: 0.5 }}>
                  <Box>
                    {user.user_metadata?.full_name && (
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>
                        {user.user_metadata.full_name}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(124,58,237,0.12)', my: 0.5 }} />
                <MenuItem
                  onClick={() => { signOut(); setMenuAnchor(null); }}
                  sx={{
                    fontSize: '0.82rem',
                    fontFamily: '"Raleway", sans-serif',
                    color: '#94a3b8',
                    '&:hover': { color: '#e2e8f0', background: 'rgba(124,58,237,0.1)' },
                  }}
                >
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              onClick={() => setSignInOpen(true)}
              variant="outlined"
              size="small"
              sx={{
                fontFamily: '"Raleway", sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                color: '#a78bfa',
                borderColor: 'rgba(167,139,250,0.4)',
                borderRadius: '6px',
                px: 1.75,
                py: 0.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#a78bfa',
                  background: 'rgba(167,139,250,0.08)',
                },
              }}
            >
              Sign In
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
