alter table orders
  alter column status set default 'processing';

alter table orders
  add column if not exists payment_status text default 'unverified',
  add column if not exists paypal_capture_id text,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_amount numeric(10,2),
  add column if not exists payment_currency text default 'USD';

update orders
set payment_status = 'unverified'
where payment_status is null;
