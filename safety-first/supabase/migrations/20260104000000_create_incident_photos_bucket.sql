-- Create public bucket for incident photos
-- Story 2.6: Photo Capture and Upload

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('incident-photos', 'incident-photos', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Drop policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Public can upload incident photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view incident photos" ON storage.objects;

-- Allow public uploads (anonymous users can submit reports)
CREATE POLICY "Public can upload incident photos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'incident-photos');

-- Allow public reads (photos are part of public reports)
CREATE POLICY "Public can view incident photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'incident-photos');
