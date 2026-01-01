create table if not exists profiles (
  id uuid primary key references auth.users not null,
  email text,
  plan text default 'free',
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;

create policy "Users can select their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can upsert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);
