-- Insert the storage bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- RLS policies for storage

-- Admins can upload, update, and delete files
create policy "Admins can upload to documents" on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and public.is_admin()
  );

create policy "Admins can update documents" on storage.objects for update
  using (
    bucket_id = 'documents'
    and public.is_admin()
  );

create policy "Admins can delete documents" on storage.objects for delete
  using (
    bucket_id = 'documents'
    and public.is_admin()
  );

-- Admins can read all files
create policy "Admins can read all documents" on storage.objects for select
  using (
    bucket_id = 'documents'
    and public.is_admin()
  );

-- Clients can read their own files
create policy "Clients can read own documents" on storage.objects for select
  using (
    bucket_id = 'documents'
    and public.get_client_id()::text = (string_to_array(name, '/'))[1]
  );
