import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/steam-proxy`;

async function steamProxy(action, params = {}) {
  const url = new URL(PROXY_URL);
  url.searchParams.set('action', action);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

export function useSteamTracker() {
  const [trackedGames, setTrackedGames] = useState([]);
  const [achievements, setAchievements] = useState({});
  const [library, setLibrary] = useState([]);
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [error, setError] = useState(null);
  const fetchedIds = useRef(new Set());

  const fetchTracked = useCallback(async () => {
    setLoadingTracked(true);
    const { data, error: err } = await supabase
      .from('steam_game_status')
      .select('*')
      .order('added_at', { ascending: false });
    if (err) setError(err.message);
    else setTrackedGames(data ?? []);
    setLoadingTracked(false);
  }, []);

  useEffect(() => { fetchTracked(); }, [fetchTracked]);

  useEffect(() => {
    const toFetch = trackedGames
      .map((g) => g.app_id)
      .filter((id) => !fetchedIds.current.has(id));
    if (!toFetch.length) return;
    toFetch.forEach((id) => fetchedIds.current.add(id));

    Promise.allSettled(
      toFetch.map(async (appId) => {
        try {
          const data = await steamProxy('getAchievements', { appid: appId });
          const list = data?.playerstats?.achievements ?? [];
          return [appId, list.length === 0
            ? null
            : { total: list.length, achieved: list.filter((a) => a.achieved === 1).length }
          ];
        } catch {
          return [appId, null];
        }
      })
    ).then((results) => {
      const updates = {};
      for (const r of results) {
        if (r.status === 'fulfilled') {
          const [id, ach] = r.value;
          updates[id] = ach;
        }
      }
      setAchievements((prev) => ({ ...prev, ...updates }));
    });
  }, [trackedGames]);

  const loadLibrary = useCallback(async () => {
    if (library.length > 0) return;
    setLoadingLibrary(true);
    try {
      const data = await steamProxy('getOwnedGames');
      const games = (data?.response?.games ?? []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setLibrary(games);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingLibrary(false);
    }
  }, [library.length]);

  const addGame = useCallback(async (appId, gameName, status, imgIconUrl) => {
    const { error: err } = await supabase.from('steam_game_status').upsert({
      app_id: appId,
      game_name: gameName,
      status,
      img_icon_url: imgIconUrl ?? null,
    });
    if (err) throw err;
    await fetchTracked();
  }, [fetchTracked]);

  const updateStatus = useCallback(async (appId, status) => {
    const { error: err } = await supabase
      .from('steam_game_status')
      .update({ status })
      .eq('app_id', appId);
    if (err) throw err;
    setTrackedGames((prev) =>
      prev.map((g) => (g.app_id === appId ? { ...g, status } : g))
    );
  }, []);

  const removeGame = useCallback(async (appId) => {
    const { error: err } = await supabase
      .from('steam_game_status')
      .delete()
      .eq('app_id', appId);
    if (err) throw err;
    fetchedIds.current.delete(appId);
    setTrackedGames((prev) => prev.filter((g) => g.app_id !== appId));
    setAchievements((prev) => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
  }, []);

  const loadingAchievements = trackedGames.some((g) => !(g.app_id in achievements));

  const games = trackedGames.map((g) => {
    const ach = g.app_id in achievements ? achievements[g.app_id] : undefined;
    const completed = ach != null && ach.total > 0 && ach.achieved === ach.total;
    const pct = ach != null ? Math.round((ach.achieved / ach.total) * 100) : null;
    return { ...g, achievements: ach, completed, pct };
  });

  return {
    games,
    library,
    loadingTracked,
    loadingLibrary,
    loadingAchievements,
    error,
    loadLibrary,
    addGame,
    updateStatus,
    removeGame,
  };
}
