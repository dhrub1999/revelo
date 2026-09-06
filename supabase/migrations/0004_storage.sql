-- Storage buckets for bike + submission photos.

insert into storage.buckets (id, name, public)
values
  ('bike-photos', 'bike-photos', true),
  ('submission-photos', 'submission-photos', true)
on conflict (id) do nothing;

-- Anyone can view (both buckets are public buckets — bike photos are shown
-- to logged-out buyers on the marketplace).
create policy "bike_photos_read_public"
  on storage.objects for select
  using (bucket_id = 'bike-photos');

create policy "submission_photos_read_public"
  on storage.objects for select
  using (bucket_id = 'submission-photos');

-- Only authenticated users (sellers/admin) can upload. Object path convention
-- is `<seller_id>/<...>` so a seller can only write into their own folder;
-- admin (uploading on a seller's behalf via P2) is exempt from that check.
create policy "bike_photos_write_own_folder_or_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'bike-photos'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "bike_photos_delete_own_folder_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'bike-photos'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "submission_photos_write_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'submission-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
