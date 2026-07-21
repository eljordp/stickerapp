alter table orders
  add column if not exists payment_provider text default 'paypal',
  add column if not exists payment_reference text;

update orders
set payment_provider = 'paypal'
where payment_provider is null;

create index if not exists idx_orders_payment_provider
  on orders (payment_provider, payment_status, created_at desc);
