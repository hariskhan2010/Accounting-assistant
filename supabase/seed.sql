insert into public.companies (name, type)
values
  ('Company A', 'company'),
  ('Company B', 'company'),
  ('Self', 'self')
on conflict (name) do update set type = excluded.type;

insert into public.expense_types (key, label)
values
  ('cutting', 'Cutting'),
  ('polishing', 'Polishing'),
  ('lab_testing', 'Lab Testing'),
  ('shipping_out', 'Shipping Outgoing'),
  ('shipping_in', 'Shipping Incoming'),
  ('rent', 'Rent'),
  ('utility', 'Utility'),
  ('daily', 'Daily Miscellaneous')
on conflict (key) do update set label = excluded.label;

insert into public.stock_categories (key, label)
values
  ('raw', 'Raw Materials'),
  ('polished', 'Polished Gems'),
  ('specimen', 'Mineral Specimens')
on conflict (key) do update set label = excluded.label;
