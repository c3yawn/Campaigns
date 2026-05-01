import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { Filter } from 'bad-words';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const filter = new Filter();
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function validate(value) {
  if (!value) return null;
  if (!USERNAME_RE.test(value)) return '3–20 characters. Letters, numbers, and underscores only.';
  if (filter.isProfane(value)) return 'That username is not allowed.';
  return null;
}

export default function UsernameSetupPage() {
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [available, setAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const err = validate(value);
    setValidationError(err);
    setAvailable(null);

    if (err || !value) return;

    clearTimeout(debounceRef.current);
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('username', value);
      setAvailable(count === 0);
      setChecking(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (validationError || !available || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase
      .from('profiles')
      .update({ username: value })
      .eq('id', user.id);

    if (error) {
      setSubmitError(
        error.code === '23505'
          ? 'That username was just taken. Please try another.'
          : 'Something went wrong. Please try again.'
      );
      setSubmitting(false);
      return;
    }

    await fetchProfile(user.id);
    navigate('/', { replace: true });
  }

  function statusMessage() {
    if (!value || validationError) return null;
    if (checking) return { text: 'Checking…', color: 'text.secondary' };
    if (available === true) return { text: 'Available!', color: 'success.main' };
    if (available === false) return { text: 'Already taken.', color: 'error.main' };
    return null;
  }

  const status = statusMessage();
  const canSubmit = !validationError && available === true && !checking && !submitting;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(6, 4, 20, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124, 58, 237, 0.18)',
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontFamily="Cinzel, serif" sx={{ mb: 0.5 }}>
            Choose a Username
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is your identity across the entire Yawniverse. Pick carefully — you can't change it later.
          </Typography>
        </Box>

        <Box>
          <TextField
            fullWidth
            autoFocus
            label="Username"
            value={value}
            onChange={e => setValue(e.target.value.trim())}
            error={!!validationError}
            helperText={validationError ?? ' '}
            inputProps={{ maxLength: 20 }}
          />
          {status && (
            <Typography variant="caption" sx={{ color: status.color, mt: 0.5, display: 'block' }}>
              {checking && <CircularProgress size={10} sx={{ mr: 0.5 }} />}
              {status.text}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            3–20 characters · letters, numbers, underscores
          </Typography>
        </Box>

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit}
          sx={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700 }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Confirm Username'}
        </Button>
      </Box>
    </Box>
  );
}
