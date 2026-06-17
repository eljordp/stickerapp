-- Cross-device cart restore by email.
-- Returns the most recent non-converted cart for a given email, or nothing.
-- Security-definer so anon can call it without granting broad SELECT on cart_sessions.

create or replace function public.get_saved_cart(p_email text)
returns table (
  id uuid,
  items jsonb,
  total_price numeric,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, items, total_price, created_at, updated_at
  from cart_sessions
  where lower(email) = lower(trim(p_email))
    and converted = false
    and jsonb_array_length(items) > 0
  order by updated_at desc
  limit 1;
$$;

grant execute on function public.get_saved_cart(text) to anon, authenticated;
