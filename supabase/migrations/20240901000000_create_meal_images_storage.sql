
-- Create a storage bucket for meal images
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'Meal Images', true);

-- Allow anyone to select from the bucket (needed for image URLs to work)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'meal-images');

-- Allow authenticated users to insert into the bucket
CREATE POLICY "Authenticated users can upload meal images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'meal-images' AND
    auth.role() = 'authenticated'
  );
