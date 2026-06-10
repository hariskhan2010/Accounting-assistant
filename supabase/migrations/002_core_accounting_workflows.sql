alter table public.purchases
  add column if not exists category text references public.stock_categories(key) default 'raw';

alter table public.sales
  add column if not exists category text references public.stock_categories(key) default 'polished';

alter table public.sales
  add column if not exists invoice_pdf_path text;

create index if not exists purchases_category_idx on public.purchases(category);
create index if not exists sales_category_idx on public.sales(category);
