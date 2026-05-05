-- Called by the creature-sprite Edge Function on every image load.
-- Increments views atomically; no read-then-write race condition.
create or replace function increment_creature_views(p_creature_id uuid)
returns void
language sql
security definer
as $$
  update creatures
  set views = views + 1,
      unique_views = unique_views + 1
  where id = p_creature_id;
$$;
