-- The Sticker Smith - Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project

-- 1. Contact form submissions
create table if not exists contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  service text,
  message text not null,
  source text default 'contact-page',
  created_at timestamptz default now()
);

-- 2. Orders (synced from PayPal checkout)
create table if not exists orders (
  id text primary key, -- PayPal order ID
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_state text,
  customer_zip text,
  items jsonb not null default '[]',
  total numeric(10,2) not null,
  status text default 'processing' check (status in ('processing', 'shipped', 'completed')),
  payment_status text default 'unverified' check (payment_status in ('unverified', 'captured', 'not_captured', 'not_found', 'refunded')),
  paypal_capture_id text,
  payment_verified_at timestamptz,
  payment_amount numeric(10,2),
  payment_currency text default 'USD',
  created_at timestamptz default now()
);

-- 3. Cart sessions (for abandoned cart tracking)
create table if not exists cart_sessions (
  id uuid default gen_random_uuid() primary key,
  email text,
  items jsonb not null default '[]',
  total_price numeric(10,2) default 0,
  converted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Admin user roles
create type user_role as enum ('admin', 'user');

create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role user_role default 'user',
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- RPC function to check admin role
create or replace function has_role(_user_id uuid, _role text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from user_roles
    where user_id = _user_id
    and role = _role::user_role
  );
end;
$$;

-- Row Level Security
alter table contact_submissions enable row level security;
alter table orders enable row level security;
alter table cart_sessions enable row level security;
grant select, insert, update on cart_sessions to anon;
grant select, insert, update on cart_sessions to authenticated;
alter table user_roles enable row level security;

-- Anyone can insert contact submissions
create policy "Anyone can submit contact form"
  on contact_submissions for insert
  with check (true);

-- Only admins can read contact submissions
create policy "Admins can read contact submissions"
  on contact_submissions for select
  using (has_role(auth.uid(), 'admin'));

-- Anyone can insert orders (from checkout)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

-- Admins can read/update orders
create policy "Admins can read orders"
  on orders for select
  using (has_role(auth.uid(), 'admin'));

create policy "Admins can update orders"
  on orders for update
  using (has_role(auth.uid(), 'admin'));

-- Anyone can create/update cart sessions
create policy "Anyone can create cart sessions"
  on cart_sessions for insert
  with check (true);

create policy "Anyone can update their cart session"
  on cart_sessions for update
  with check (true);

-- Admins can read cart sessions
create policy "Admins can read cart sessions"
  on cart_sessions for select
  using (has_role(auth.uid(), 'admin'));

-- Only admins can read user_roles
create policy "Admins can read roles"
  on user_roles for select
  using (has_role(auth.uid(), 'admin') or user_id = auth.uid());

-- SETUP: After running this schema, create an admin user:
-- 1. Go to Authentication > Users > Create User
-- 2. Set email: thestickersmith@gmail.com, set a secure password
-- 3. Then run:
--    INSERT INTO user_roles (user_id, role)
--    VALUES ('<user-id-from-step-2>', 'admin');
