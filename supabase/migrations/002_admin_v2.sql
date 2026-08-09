-- Run after schema.sql in Supabase SQL Editor.
alter table public.quote_requests add column if not exists status text not null default 'new' check (status in ('new','quoted','won','lost'));
alter table public.quote_requests add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.quote_requests add column if not exists attachment_paths text[] not null default '{}';
create index if not exists quote_requests_status_idx on public.quote_requests(status);
drop policy if exists "Authenticated admins can update quote requests" on public.quote_requests;
create policy "Authenticated admins can update quote requests"
  on public.quote_requests for update
  to authenticated
  using (true)
  with check (true);
drop policy if exists "Authenticated admins can delete quote requests" on public.quote_requests;
create policy "Authenticated admins can delete quote requests"
  on public.quote_requests for delete
  to authenticated
  using (true);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null check (char_length(event_name) between 2 and 80),
  path text not null default '/',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
alter table public.analytics_events enable row level security;
drop policy if exists "Anyone can log analytics" on public.analytics_events;
create policy "Anyone can log analytics" on public.analytics_events for insert to anon, authenticated with check (true);
drop policy if exists "Authenticated admins can read analytics" on public.analytics_events;
create policy "Authenticated admins can read analytics" on public.analytics_events for select to authenticated using (true);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);

insert into storage.buckets (id, name, public) values ('quote-attachments', 'quote-attachments', false) on conflict (id) do nothing;
drop policy if exists "Authenticated admins can read quote attachments" on storage.objects;
create policy "Authenticated admins can read quote attachments" on storage.objects for select to authenticated using (bucket_id = 'quote-attachments');
drop policy if exists "Anyone can upload quote attachments" on storage.objects;
create policy "Anyone can upload quote attachments" on storage.objects for insert to anon, authenticated with check (bucket_id = 'quote-attachments');
