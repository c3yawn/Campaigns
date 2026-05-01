import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, username')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const redirectTo = window.location.origin + import.meta.env.BASE_URL;

  function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  }

  function signInWithDiscord() {
    return supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo } });
  }

  function signOut() {
    return supabase.auth.signOut();
  }

  const isAdmin = user?.app_metadata?.role === 'admin';
  const needsUsername = !!user && profile !== null && !profile.username;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, needsUsername, fetchProfile, signInWithGoogle, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
