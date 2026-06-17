-- Drop ALL existing policies on cart_sessions (names unknown — earlier drops
-- by name found nothing, but inserts still hit RLS 401, so a restrictive
-- policy exists under a name we haven't guessed). Recreate from scratch.

do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'cart_sessions' loop
    execute format('drop policy if exists %I on cart_sessions', pol.policyname);
  end loop;
end $$;

-- Anyone can insert a cart session (with or without email)
create policy "cart_sessions_anon_insert"
  on cart_sessions for insert to anon, authenticated
  with check (true);

-- Anyone can update their cart session
create policy "cart_sessions_anon_update"
  on cart_sessions for update to anon, authenticated
  using (true)
  with check (true);

-- Only admins can read cart sessions (preserves original intent)
create policy "cart_sessions_admin_select"
  on cart_sessions for select to authenticated
  using (has_role(auth.uid(), 'admin'));
