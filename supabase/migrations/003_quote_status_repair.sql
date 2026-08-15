-- Run this once on an existing Supabase project where the admin shows
-- "Could not find the 'status' column ... in the schema cache".
-- It also repairs quote attachment support for the admin dashboard.
alter table public.quote_requests add column if not exists status text not null default 'new' check (status in ('new','quoted','won','lost'));
alter table public.quote_requests add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.quote_requests add column if not exists attachment_paths text[] not null default '{}';
create index if not exists quote_requests_status_idx on public.quote_requests(status);

drop policy if exists "Authenticated admins can update quote requests" on public.quote_requests;
create policy "Authenticated admins can update quote requests"
  on public.quote_requests for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated admins can delete quote requests" on public.quote_requests;
create policy "Authenticated admins can delete quote requests"
  on public.quote_requests for delete to authenticated using (true);

insert into storage.buckets (id, name, public)
values ('quote-attachments', 'quote-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated admins can read quote attachments" on storage.objects;
create policy "Authenticated admins can read quote attachments"
  on storage.objects for select to authenticated
  using (bucket_id = 'quote-attachments');

drop policy if exists "Anyone can upload quote attachments" on storage.objects;
create policy "Anyone can upload quote attachments"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'quote-attachments');

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
