-- Create clients table
create table clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  platform    text not null,
  sector      text,
  color       text not null default '#0E6E56',
  short_code  text not null,
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

-- Create profiles table (extends Supabase auth.users)
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  client_id   uuid references clients(id) on delete set null,
  role        text not null default 'member',
  display_name text,
  created_at  timestamptz default now()
);

-- Create categories table
create table categories (
  id    serial primary key,
  name  text not null unique
);

-- Seed categories
insert into categories (name) values
  ('User Manual'),
  ('Technical Manual'),
  ('Knowledge Transfer'),
  ('Onboarding Document'),
  ('Troubleshooting Document');

-- Create documents table
create table documents (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  category_id   integer not null references categories(id),
  title         text not null,
  version       text not null default 'v1.0',
  file_type     text not null,
  storage_path  text not null,
  status        text not null default 'Draft',
  updated_at    timestamptz default now(),
  created_at    timestamptz default now(),
  created_by    uuid references auth.users(id)
);

-- Create access_events table (audit log)
create table access_events (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id),
  document_id  uuid not null references documents(id),
  client_id    uuid not null references clients(id),
  action       text not null,
  user_email   text not null,
  document_title text not null,
  client_name  text not null,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz default now()
);

-- Enable RLS on all tables
alter table clients enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table documents enable row level security;
alter table access_events enable row level security;

-- Helper functions to avoid recursive RLS policy loops
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

create or replace function public.get_client_id()
returns uuid as $$
begin
  return (
    select client_id from public.profiles
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- RLS Policies for clients
create policy "client_select" on clients for select
  using (
    public.is_admin()
    or id = public.get_client_id()
  );

create policy "admin_write" on clients for all
  using (public.is_admin());

-- RLS Policies for profiles (non-recursive)
create policy "profiles_read_own_or_admin" on profiles for select
  using (
    id = auth.uid()
    or public.is_admin()
  );

create policy "admin_manage_profiles" on profiles for all
  using (public.is_admin());

-- RLS Policies for categories
create policy "categories_select" on categories for select
  using (true); -- everyone can read categories

create policy "categories_admin_write" on categories for all
  using (public.is_admin());

-- RLS Policies for documents
create policy "client_doc_select" on documents for select
  using (
    public.is_admin()
    or (
      client_id = public.get_client_id()
      and status = 'Ready'
    )
  );

create policy "admin_doc_write" on documents for all
  using (public.is_admin());

-- RLS Policies for access_events
create policy "audit_select" on access_events for select
  using (
    public.is_admin()
    or user_id = auth.uid()
  );

create policy "audit_insert" on access_events for insert
  with check (auth.uid() is not null);
