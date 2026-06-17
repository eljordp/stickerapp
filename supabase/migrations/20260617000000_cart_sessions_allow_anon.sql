-- Allow abandoned-cart tracking without requiring an email.
-- The deployed policy required `email is not null`, which silently dropped
-- ~100% of carts since the email modal never opens. Replace with an open
-- insert/update policy so every cart can be counted.

drop policy if exists "Anyone can insert their cart session" on cart_sessions;
drop policy if exists "Anyone can insert cart session" on cart_sessions;
drop policy if exists "Anyone can submit cart session" on cart_sessions;
drop policy if exists "Anyone can update their cart session" on cart_sessions;
drop policy if exists "Anyone can update cart session" on cart_sessions;

create policy "Anyone can insert cart session"
  on cart_sessions for insert
  with check (true);

create policy "Anyone can update cart session"
  on cart_sessions for update
  with check (true);
