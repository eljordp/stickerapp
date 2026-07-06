-- Admin login / security audit log.
-- Server-side API routes insert with the service-role key; admins can read in the dashboard.

create table if not exists admin_audit_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  event_type text not null,
  outcome text not null default 'success',
  ip_address text,
  country text,
  region text,
  city text,
  user_agent text,
  path text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_events_created_at_idx on admin_audit_events (created_at desc);
create index if not exists admin_audit_events_user_created_idx on admin_audit_events (user_id, created_at desc);
create index if not exists admin_audit_events_ip_idx on admin_audit_events (ip_address);

alter table admin_audit_events enable row level security;

grant select on admin_audit_events to authenticated;

drop policy if exists "Admins can read admin audit events" on admin_audit_events;
create policy "Admins can read admin audit events"
  on admin_audit_events for select
  using (has_role(auth.uid(), 'admin'));
