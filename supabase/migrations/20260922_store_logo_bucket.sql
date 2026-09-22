-- Jalankan di SQL Editor Supabase sebelum mengunggah logo.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('store-assets', 'store-assets', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS store_assets_admin_upload ON storage.objects;
CREATE POLICY store_assets_admin_upload ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'store-assets' AND public.current_app_role() = 'admin');
