-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true);

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload report images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images');

-- Allow anyone to view report images
CREATE POLICY "Anyone can view report images"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

-- Allow anyone to delete report images
CREATE POLICY "Anyone can delete report images"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images');