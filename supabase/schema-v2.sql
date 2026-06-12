-- The Sticker Smith - Schema V2: Analytics, Referrals, CRM
-- Run this AFTER the original schema.sql

-- 5. Page views (analytics)
create table if not exists page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  referrer text,
  session_id text,
  visitor_id text,
  user_agent text,
  screen_width int,
  created_at timestamptz default now()
);

-- 6. Click events (heatmap/interaction tracking)
create table if not exists click_events (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  element text, -- CSS selector or description
  x_percent numeric(5,2), -- % from left
  y_percent numeric(5,2), -- % from top
  session_id text,
  visitor_id text,
  created_at timestamptz default now()
);

-- 7. Navigation events (funnel/drop-off tracking)
create table if not exists nav_events (
  id uuid default gen_random_uuid() primary key,
  from_path text,
  to_path text,
  session_id text,
  visitor_id text,
  duration_ms int, -- time spent on from_path
  created_at timestamptz default now()
);

-- 8. Customers (CRM)
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  total_spent numeric(10,2) default 0,
  order_count int default 0,
  referred_by uuid references customers(id),
  referral_code text unique,
  source text, -- 'checkout', 'cart-email', 'contact', 'referral'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Referral tracking
create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references customers(id) on delete cascade,
  referred_id uuid references customers(id) on delete cascade,
  referral_code text not null,
  status text default 'clicked' check (status in ('clicked', 'signed_up', 'purchased')),
  order_id text references orders(id),
  created_at timestamptz default now(),
  unique(referrer_id, referred_id)
);

-- RLS
alter table page_views enable row level security;
alter table click_events enable row level security;
alter table nav_events enable row level security;
alter table customers enable row level security;
alter table referrals enable row level security;

-- Anyone can insert analytics (anonymous tracking)
create policy "Anyone can log page views" on page_views for insert with check (true);
create policy "Anyone can log clicks" on click_events for insert with check (true);
create policy "Anyone can log navigation" on nav_events for insert with check (true);

-- Anyone can insert/update customers (from checkout/contact)
create policy "Anyone can create customers" on customers for insert with check (true);
create policy "Anyone can update customers" on customers for update with check (true);

-- Anyone can create referrals
create policy "Anyone can create referrals" on referrals for insert with check (true);
create policy "Anyone can update referrals" on referrals for update with check (true);

-- Only admins read analytics/CRM
create policy "Admins can read page views" on page_views for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read clicks" on click_events for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read navigation" on nav_events for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read customers" on customers for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read referrals" on referrals for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can update customers" on customers for update using (has_role(auth.uid(), 'admin'));

-- Helper: Get or create customer by email
create or replace function get_or_create_customer(_email text, _first_name text default null, _last_name text default null, _phone text default null, _source text default 'unknown')
returns uuid
language plpgsql
security definer
as $$
declare
  _id uuid;
  _code text;
begin
  select id into _id from customers where email = lower(trim(_email));
  if _id is not null then
    update customers set
      first_name = coalesce(_first_name, customers.first_name),
      last_name = coalesce(_last_name, customers.last_name),
      phone = coalesce(_phone, customers.phone),
      updated_at = now()
    where id = _id;
    return _id;
  end if;

  -- Generate unique referral code (6 chars)
  _code := upper(substr(md5(random()::text), 1, 6));
  while exists (select 1 from customers where referral_code = _code) loop
    _code := upper(substr(md5(random()::text), 1, 6));
  end loop;

  insert into customers (email, first_name, last_name, phone, source, referral_code)
  values (lower(trim(_email)), _first_name, _last_name, _phone, _source, _code)
  returning id into _id;

  return _id;
end;
$$;

-- Helper: Record a purchase for CRM
create or replace function record_purchase(_email text, _order_id text, _total numeric)
returns void
language plpgsql
security definer
as $$
declare
  _customer_id uuid;
begin
  select id into _customer_id from customers where email = lower(trim(_email));
  if _customer_id is not null then
    update customers set
      total_spent = total_spent + _total,
      order_count = order_count + 1,
      updated_at = now()
    where id = _customer_id;

    -- Update referral status if this customer was referred
    update referrals set status = 'purchased', order_id = _order_id
    where referred_id = _customer_id and status != 'purchased';
  end if;
end;
$$;

-- Grant execute on functions
grant execute on function get_or_create_customer to anon, authenticated;
grant execute on function record_purchase to anon, authenticated;

-- 10. Store-wide pricing
create table if not exists pricing_configs (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz default now()
);

alter table pricing_configs enable row level security;

drop policy if exists "Anyone can read pricing configs" on pricing_configs;
drop policy if exists "Admins can insert pricing configs" on pricing_configs;
drop policy if exists "Admins can update pricing configs" on pricing_configs;

create policy "Anyone can read pricing configs" on pricing_configs for select using (true);
create policy "Admins can insert pricing configs" on pricing_configs for insert with check (has_role(auth.uid(), 'admin'));
create policy "Admins can update pricing configs" on pricing_configs for update using (has_role(auth.uid(), 'admin'));

-- 11. Email list
create table if not exists email_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  service_interest text,
  source text,
  status text default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  tags text[] default '{}'::text[],
  consented_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table email_subscribers enable row level security;

drop policy if exists "Admins can read subscribers" on email_subscribers;
drop policy if exists "Admins can update subscribers" on email_subscribers;

create policy "Admins can read subscribers" on email_subscribers for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can update subscribers" on email_subscribers for update using (has_role(auth.uid(), 'admin'));

create or replace function upsert_email_subscriber(
  _email text,
  _name text default null,
  _phone text default null,
  _source text default 'website',
  _service_interest text default null,
  _tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _id uuid;
begin
  if _email is null or length(trim(_email)) = 0 then
    raise exception 'Email is required';
  end if;

  insert into email_subscribers (
    email,
    name,
    phone,
    source,
    service_interest,
    tags,
    status,
    consented_at,
    updated_at
  )
  values (
    lower(trim(_email)),
    nullif(trim(_name), ''),
    nullif(trim(_phone), ''),
    nullif(trim(_source), ''),
    nullif(trim(_service_interest), ''),
    coalesce(_tags, '{}'::text[]),
    'subscribed',
    now(),
    now()
  )
  on conflict (email) do update set
    name = coalesce(excluded.name, email_subscribers.name),
    phone = coalesce(excluded.phone, email_subscribers.phone),
    source = coalesce(excluded.source, email_subscribers.source),
    service_interest = coalesce(excluded.service_interest, email_subscribers.service_interest),
    status = 'subscribed',
    consented_at = now(),
    updated_at = now(),
    tags = (
      select coalesce(array_agg(distinct t.tag), '{}'::text[])
      from unnest(coalesce(email_subscribers.tags, '{}'::text[]) || coalesce(excluded.tags, '{}'::text[])) as t(tag)
      where t.tag <> ''
    )
  returning id into _id;

  return _id;
end;
$$;

grant execute on function upsert_email_subscriber to anon, authenticated;
