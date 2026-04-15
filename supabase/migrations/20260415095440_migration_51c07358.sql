-- Create storage bucket for food photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-photos', 'food-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Users can upload food photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'food-photos');

-- Allow authenticated users to update their photos
CREATE POLICY "Users can update food photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'food-photos');

-- Allow authenticated users to delete their photos
CREATE POLICY "Users can delete food photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'food-photos');

-- Allow public read access
CREATE POLICY "Public read access for food photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'food-photos');