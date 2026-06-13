-- 1. Modify clients table
alter table public.clients drop column color;
alter table public.clients add column logo_url text;

-- 2. Create logos bucket
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- 3. RLS policies for logos
create policy "Public can view logos" on storage.objects for select
  using (bucket_id = 'logos');

create policy "Admins can upload logos" on storage.objects for insert
  with check (bucket_id = 'logos' and public.is_admin());

create policy "Admins can update logos" on storage.objects for update
  using (bucket_id = 'logos' and public.is_admin());

create policy "Admins can delete logos" on storage.objects for delete
  using (bucket_id = 'logos' and public.is_admin());
