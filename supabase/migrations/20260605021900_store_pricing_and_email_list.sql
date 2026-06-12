-- Store-wide admin pricing + email list for The Sticker Smith.
-- Safe to run once in Supabase SQL Editor before deploying the frontend.

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
