-- Durable first/last-touch attribution for every lead, cart, paid order, and
-- phone/CTA click. JSONB keeps vendor click IDs and future UTM fields together
-- without adding a new column for every ad platform.
alter table contact_submissions
  add column if not exists attribution jsonb not null default '{}'::jsonb;

alter table orders
  add column if not exists visitor_id text,
  add column if not exists session_id text,
  add column if not exists attribution jsonb not null default '{}'::jsonb;

alter table cart_sessions
  add column if not exists visitor_id text,
  add column if not exists session_id text,
  add column if not exists attribution jsonb not null default '{}'::jsonb;

alter table click_events
  add column if not exists event_type text not null default 'click',
  add column if not exists attribution jsonb not null default '{}'::jsonb;

create index if not exists contact_submissions_attribution_source_idx
  on contact_submissions ((attribution #>> '{lastTouch,source}'));

create index if not exists orders_attribution_source_idx
  on orders ((attribution #>> '{lastTouch,source}'));

create index if not exists click_events_event_type_created_at_idx
  on click_events (event_type, created_at desc);
