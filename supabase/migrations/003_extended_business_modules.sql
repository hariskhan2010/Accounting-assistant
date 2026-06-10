alter table public.staff
  add column if not exists company_id uuid references public.companies(id);

alter table public.salaries
  add column if not exists company_id uuid references public.companies(id);

alter table public.minerals
  add column if not exists notes text;

create index if not exists staff_company_idx on public.staff(company_id);
create index if not exists salaries_company_period_idx on public.salaries(company_id, year desc, month desc);
create index if not exists minerals_company_date_idx on public.minerals(company_id, date desc);
