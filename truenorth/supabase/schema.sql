-- Run this in Supabase SQL Editor.
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 320),
  project_type text not null check (char_length(project_type) between 2 and 120),
  area integer check (area is null or area between 1 and 100000000),
  message text not null check (char_length(message) between 2 and 5000),
  status text not null default 'new' check (status in ('new','quoted','won','lost')),
  updated_at timestamptz not null default timezone('utc', now()),
  attachment_paths text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.quote_requests enable row level security;

drop policy if exists "Anyone can submit quote requests" on public.quote_requests;
create policy "Anyone can submit quote requests"
  on public.quote_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated admins can read quote requests" on public.quote_requests;
create policy "Authenticated admins can read quote requests"
  on public.quote_requests for select
  to authenticated
  using (true);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

create index if not exists quote_requests_status_idx
  on public.quote_requests(status);

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
