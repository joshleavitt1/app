-- Enable extensions
create extension if not exists "uuid-ossp";

-- Meeting type enum
do $$ begin
  if not exists (select 1 from pg_type where typname = 'meeting_type') then
    create type public.meeting_type as enum ('check_in', 'qbr', 'renewal', 'expansion', 'pitch', 'support', 'other');
  end if;
end $$;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  stripe_customer_id text,
  subscription_status text,
  subscription_tier text,
  billing_cycle_anchor timestamptz,
  created_at timestamptz default timezone('utc' :: text, now()) not null,
  updated_at timestamptz default timezone('utc' :: text, now()) not null
);

-- Narratives table
create table if not exists public.narratives (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles (id) on delete cascade,
  title text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc' :: text, now()) not null,
  updated_at timestamptz default timezone('utc' :: text, now()) not null
);

-- Update timestamp trigger
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_narratives_updated on public.narratives;
create trigger set_narratives_updated before update on public.narratives for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated on public.profiles;
create trigger set_profiles_updated before update on public.profiles for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.narratives enable row level security;

-- Profiles policies
create policy "Users can view their profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert their profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their profile" on public.profiles
  for update using (auth.uid() = id);

-- Narratives policies
create policy "Users can read their narratives" on public.narratives
  for select using (auth.uid() = user_id);

create policy "Users can insert narratives" on public.narratives
  for insert with check (auth.uid() = user_id);

create policy "Users can update their narratives" on public.narratives
  for update using (auth.uid() = user_id);
