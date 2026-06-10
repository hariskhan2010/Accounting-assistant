create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('company', 'self')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('owner', 'admin', 'accountant', 'staff')),
  default_company_id uuid references public.companies(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_types (
  key text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_categories (
  key text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  date date not null,
  item text not null,
  quantity numeric(14, 3) not null check (quantity >= 0),
  unit text not null,
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  total numeric(14, 2) generated always as (quantity * unit_price) stored,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  date date not null,
  item text not null,
  quantity numeric(14, 3) not null check (quantity >= 0),
  unit text not null default 'ct',
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  total numeric(14, 2) generated always as (quantity * unit_price) stored,
  buyer text not null,
  invoice_no text not null unique,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  date date not null,
  type text not null references public.expense_types(key),
  amount numeric(14, 2) not null check (amount >= 0),
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  date date not null,
  item_name text not null,
  category text not null references public.stock_categories(key),
  direction text not null check (direction in ('in', 'out')),
  quantity numeric(14, 3) not null check (quantity >= 0),
  unit text not null,
  reference_table text,
  reference_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.minerals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  date date not null,
  name text not null,
  purchase_price numeric(14, 2) not null default 0 check (purchase_price >= 0),
  sale_price numeric(14, 2) check (sale_price is null or sale_price >= 0),
  status text not null default 'in_stock' check (status in ('in_stock', 'sold', 'archived')),
  profit numeric(14, 2) generated always as (coalesce(sale_price, 0) - purchase_price) stored,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text not null,
  monthly_salary numeric(14, 2) not null check (monthly_salary >= 0),
  join_date date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.salaries (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2200),
  amount_paid numeric(14, 2) not null check (amount_paid >= 0),
  payment_date date,
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (staff_id, month, year)
);

create table if not exists public.closing_balances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  period_type text not null check (period_type in ('day', 'month', 'year')),
  period_start date not null,
  opening_balance numeric(14, 2) not null default 0,
  total_sales numeric(14, 2) not null default 0,
  total_purchases numeric(14, 2) not null default 0,
  total_expenses numeric(14, 2) not null default 0,
  net_profit numeric(14, 2) not null default 0,
  closing_balance numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, period_type, period_start)
);

create index if not exists purchases_company_date_idx on public.purchases(company_id, date desc);
create index if not exists sales_company_date_idx on public.sales(company_id, date desc);
create index if not exists expenses_company_date_idx on public.expenses(company_id, date desc);
create index if not exists stock_entries_company_item_idx on public.stock_entries(company_id, item_name, category);
create index if not exists minerals_company_status_idx on public.minerals(company_id, status);
create index if not exists closing_balances_company_period_idx on public.closing_balances(company_id, period_type, period_start desc);

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.expense_types enable row level security;
alter table public.stock_categories enable row level security;
alter table public.purchases enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;
alter table public.stock_entries enable row level security;
alter table public.minerals enable row level security;
alter table public.staff enable row level security;
alter table public.salaries enable row level security;
alter table public.closing_balances enable row level security;

create policy "authenticated can read companies" on public.companies for select to authenticated using (true);
create policy "authenticated can read expense types" on public.expense_types for select to authenticated using (true);
create policy "authenticated can read stock categories" on public.stock_categories for select to authenticated using (true);
create policy "users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create policy "authenticated can read purchases" on public.purchases for select to authenticated using (true);
create policy "authenticated can insert purchases" on public.purchases for insert to authenticated with check (created_by = auth.uid());
create policy "authenticated can read sales" on public.sales for select to authenticated using (true);
create policy "authenticated can insert sales" on public.sales for insert to authenticated with check (created_by = auth.uid());
create policy "authenticated can read expenses" on public.expenses for select to authenticated using (true);
create policy "authenticated can insert expenses" on public.expenses for insert to authenticated with check (created_by = auth.uid());
create policy "authenticated can read stock entries" on public.stock_entries for select to authenticated using (true);
create policy "authenticated can insert stock entries" on public.stock_entries for insert to authenticated with check (created_by = auth.uid());
create policy "authenticated can read minerals" on public.minerals for select to authenticated using (true);
create policy "authenticated can insert minerals" on public.minerals for insert to authenticated with check (created_by = auth.uid());
create policy "authenticated can read staff" on public.staff for select to authenticated using (true);
create policy "authenticated can read salaries" on public.salaries for select to authenticated using (true);
create policy "authenticated can read closing balances" on public.closing_balances for select to authenticated using (true);
