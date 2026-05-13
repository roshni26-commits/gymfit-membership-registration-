-- Run this in Supabase: SQL Editor → New query → Run
-- Creates the table the app writes to on registration (gym-store.ts).

create table if not exists public.gym_users (
  id uuid primary key,
  rank integer,
  full_name text not null,
  age integer not null,
  gender text not null,
  mobile text not null,
  email text not null unique,
  address text not null default '',
  password text not null,
  plan text not null,
  goal text not null,
  timing text not null,
  created_at timestamptz not null default now()
);

alter table public.gym_users enable row level security;

drop policy if exists "gym_users_anon_insert" on public.gym_users;
drop policy if exists "gym_users_anon_select" on public.gym_users;

create policy "gym_users_anon_insert"
  on public.gym_users for insert
  to anon, authenticated
  with check (true);

create policy "gym_users_anon_select"
  on public.gym_users for select
  to anon, authenticated
  using (true);
