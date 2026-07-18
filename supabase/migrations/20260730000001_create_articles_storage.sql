-- Migration: Create articles storage bucket with RLS
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('articles', 'articles', true, 5242880, '{"image/jpeg","image/png","image/gif","image/webp"}')
on conflict (id) do nothing;

-- Public read for article images
create policy "Public read article images"
on storage.objects for select
using (bucket_id = 'articles');

-- Authenticated upload for article images
create policy "Authenticated upload article images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'articles' and (storage.foldername(name))[1] = auth.uid()::text);

-- Owner can update/delete their own article images
create policy "Owner update article images"
on storage.objects for update
to authenticated
using (bucket_id = 'articles' and owner_id = auth.uid()::text);

create policy "Owner delete article images"
on storage.objects for delete
to authenticated
using (bucket_id = 'articles' and owner_id = auth.uid()::text);
