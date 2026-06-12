-- Square OAuth, invoice tracking, and expanded admin team roles.
-- Run in Supabase SQL Editor before using the Square admin tab.

do $$
begin
  alter type user_role add value if not exists 'owner';
  alter type user_role add value if not exists 'manager';
  alter type user_role add value if not exists 'sales';
  alter type user_role add value if not exists 'production';
  alter type user_role add value if not exists 'follow_up';
  alter type user_role add value if not exists 'technical';
exception
  when duplicate_object then null;
end $$;

create table if not exists square_oauth_states (
  state text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists square_connections (
  id text primary key default 'primary',
  merchant_id text,
  location_id text,
  location_name text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[] default '{}'::text[],
  status text default 'connected' check (status in ('connected', 'disconnected', 'error')),
  connected_by uuid references auth.users(id),
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists square_invoices (
  id uuid default gen_random_uuid() primary key,
  square_invoice_id text unique,
  square_invoice_number text,
  square_order_id text,
  square_customer_id text,
  local_order_id text references orders(id),
  contact_submission_id uuid references contact_submissions(id),
  customer_email text,
  customer_name text,
  title text,
  description text,
  amount numeric(10,2) not null,
  currency text default 'USD',
  status text default 'draft',
  public_url text,
  due_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table square_oauth_states enable row level security;
alter table square_connections enable row level security;
alter table square_invoices enable row level security;

drop policy if exists "Admins can read square invoices" on square_invoices;
drop policy if exists "Admins can update square invoices" on square_invoices;

create policy "Admins can read square invoices" on square_invoices for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can update square invoices" on square_invoices for update using (has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can create square invoices" on square_invoices;
create policy "Admins can create square invoices" on square_invoices for insert with check (has_role(auth.uid(), 'admin'));
