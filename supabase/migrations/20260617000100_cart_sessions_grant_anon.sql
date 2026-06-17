-- RLS policies alone aren't enough — anon role also needs explicit table grants
-- to actually read/write rows. Without this, inserts hit 401 even with permissive
-- policies in place.

grant select, insert, update on cart_sessions to anon;
grant select, insert, update on cart_sessions to authenticated;
