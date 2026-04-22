import { supabase } from '../../lib/supabase.js';

const LS_KEY = (slot) => `game_save_slot_${slot}`;

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export const saveManager = {
  async load(slot = 1) {
    const user = await getUser();
    if (user) {
      const { data } = await supabase
        .from('game_saves')
        .select('data')
        .eq('user_id', user.id)
        .eq('slot', slot)
        .maybeSingle();
      if (data) return data.data;
    }
    // Fallback to localStorage
    try {
      return JSON.parse(localStorage.getItem(LS_KEY(slot)));
    } catch {
      return null;
    }
  },

  async save(slot = 1, data) {
    // Always persist locally for instant reads on next load
    localStorage.setItem(LS_KEY(slot), JSON.stringify(data));

    const user = await getUser();
    if (!user) return;

    await supabase.from('game_saves').upsert(
      { user_id: user.id, slot, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,slot' },
    );
  },

  async list() {
    const user = await getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('game_saves')
      .select('slot, data, updated_at')
      .eq('user_id', user.id)
      .order('slot');
    return data ?? [];
  },
};
