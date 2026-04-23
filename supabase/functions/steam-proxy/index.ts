const STEAM_BASE = 'https://api.steampowered.com';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function getSteamId(apiKey: string): Promise<string> {
  const steamId = Deno.env.get('STEAM_ID');
  if (steamId) return steamId;

  const vanity = Deno.env.get('STEAM_VANITY');
  if (!vanity) throw new Error('Neither STEAM_ID nor STEAM_VANITY is configured as a Supabase secret');

  const res = await fetch(
    `${STEAM_BASE}/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(vanity)}`
  );
  const data = await res.json();
  if (data.response?.success !== 1) throw new Error(`Could not resolve Steam vanity URL: ${vanity}`);
  return data.response.steamid;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const apiKey = Deno.env.get('STEAM_API_KEY');

  if (!apiKey) return json({ error: 'STEAM_API_KEY secret not configured' }, 500);

  try {
    switch (action) {
      case 'getOwnedGames': {
        const steamId = await getSteamId(apiKey);
        const r = await fetch(
          `${STEAM_BASE}/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`
        );
        return json(await r.json());
      }

      case 'getAchievements': {
        const appid = url.searchParams.get('appid');
        if (!appid) return json({ error: 'appid required' }, 400);
        const steamId = await getSteamId(apiKey);
        const r = await fetch(
          `${STEAM_BASE}/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appid}&l=english`
        );
        return json(await r.json());
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
