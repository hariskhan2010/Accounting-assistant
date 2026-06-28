create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  stock_type text not null check (stock_type in ('investor', 'company')),
  stock_id text unique not null,
  payment_id text unique not null,
  investor_name text,
  company_name text,
  gem_type text not null,
  weight numeric(8, 3) not null,
  gem_length numeric(8, 2),
  gem_width numeric(8, 2),
  buy_price numeric(12, 2),
  shipping_price numeric(12, 2),
  sell_price numeric(12, 2),
  entry_date date not null default current_date,
  status text not null default 'available' check (status in ('available', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('ebay', 'etsy')),
  platform_order_id text not null,
  stock_id text references public.stock_items(stock_id),
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  order_amount numeric(12, 2),
  currency text not null default 'USD',
  order_date timestamptz,
  status text not null default 'pending' check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_credentials (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('ebay', 'etsy')),
  access_token text,
  refresh_token text,
  token_expiry timestamptz,
  is_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_orders_platform_order on orders(platform, platform_order_id);
create index if not exists idx_orders_platform on orders(platform);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_stock_id on orders(stock_id);
create index if not exists idx_stock_items_status on stock_items(status);
create index if not exists idx_stock_items_type on stock_items(stock_type);

alter table public.stock_items enable row level security;
alter table public.orders enable row level security;
alter table public.platform_credentials enable row level security;

create policy "Authenticated users can read stock_items"
  on public.stock_items for select
  to authenticated
  using (true);

create policy "Authenticated users can insert stock_items"
  on public.stock_items for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update stock_items"
  on public.stock_items for update
  to authenticated
  using (true);

create policy "Authenticated users can read orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated users can insert orders"
  on public.orders for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update orders"
  on public.orders for update
  to authenticated
  using (true);

create policy "Authenticated users can read platform_credentials"
  on public.platform_credentials for select
  to authenticated
  using (true);

create policy "Authenticated users can insert platform_credentials"
  on public.platform_credentials for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update platform_credentials"
  on public.platform_credentials for update
  to authenticated
  using (true);
