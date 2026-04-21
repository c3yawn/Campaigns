import { Box, Button, Dialog, DialogContent, Divider, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// To add Discord: restore DiscordIcon, handleDiscord, and the Discord Button below.
// signInWithDiscord() is already implemented in AuthContext.
// Steps: enable Discord provider in Supabase dashboard, create a Discord OAuth app,
// add client ID + secret to Supabase, then uncomment the button here.

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignInModal({ open, onClose }) {
  const { signInWithGoogle } = useAuth();

  async function handleGoogle() {
    await signInWithGoogle();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'rgba(6, 4, 20, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '16px',
          minWidth: 340,
          px: 1,
        },
      }}
    >
      <DialogContent sx={{ py: 4, px: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Cinzel", serif',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.12em',
            color: '#e2e8f0',
            mb: 0.75,
            textAlign: 'center',
          }}
        >
          Sign In
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#64748b', textAlign: 'center', mb: 3, fontSize: '0.8rem' }}
        >
          Continue with your account
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            onClick={handleGoogle}
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{
              background: '#fff',
              color: '#1f2937',
              fontFamily: '"Raleway", sans-serif',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.02em',
              py: 1.25,
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': { background: '#f1f5f9' },
            }}
          >
            Sign in with Google
          </Button>

          {/* Discord button — add when ready:
          <Button
            onClick={handleDiscord}
            startIcon={<DiscordIcon />}
            fullWidth
            sx={{
              background: '#5865F2',
              color: '#fff',
              fontFamily: '"Raleway", sans-serif',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.02em',
              py: 1.25,
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': { background: '#4752c4' },
            }}
          >
            Sign in with Discord
          </Button>
          */}
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(124,58,237,0.12)' }} />

        <Typography
          variant="caption"
          sx={{ color: '#475569', fontSize: '0.7rem', textAlign: 'center', display: 'block' }}
        >
          Your data stays in The Yawniverse.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
