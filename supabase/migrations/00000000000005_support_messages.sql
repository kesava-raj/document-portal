create table support_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  sender_role text not null, -- 'admin' or 'client'
  sender_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS
alter table support_messages enable row level security;

-- Admins can view all messages
create policy "Admins can view all support messages" on support_messages for select
  using (public.is_admin());

-- Admins can insert any message
create policy "Admins can insert support messages" on support_messages for insert
  with check (public.is_admin());

-- Admins can delete any message (optional, but good for moderation)
create policy "Admins can delete support messages" on support_messages for delete
  using (public.is_admin());

-- Clients can view their own workspace messages
create policy "Clients can view their support messages" on support_messages for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.client_id = support_messages.client_id
    )
  );

-- Clients can insert messages for their workspace
create policy "Clients can insert support messages" on support_messages for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.client_id = support_messages.client_id
    )
  );
