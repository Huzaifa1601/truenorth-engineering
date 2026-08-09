-- Run this in Supabase SQL Editor.
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 320),
  project_type text not null check (char_length(project_type) between 2 and 120),
  area integer check (area is null or area between 1 and 100000000),
  message text not null check (char_length(message) between 2 and 5000),
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
