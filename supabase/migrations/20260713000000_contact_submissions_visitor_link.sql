-- Link contact submissions to the analytics visitor/session so the admin
-- Abandoned Carts panel can match a form submission to cart activity exactly.
-- (Already applied to prod 2026-07-13 via management API; idempotent.)
alter table contact_submissions add column if not exists visitor_id text;
alter table contact_submissions add column if not exists session_id text;
