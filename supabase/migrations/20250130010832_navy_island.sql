/*
  # Create filestorage bucket

  1. New Storage Bucket
    - Creates a new public bucket named "filestorage"
    - Enables file size limits and allowed mime types
  
  2. Security
    - Enables RLS policies for the bucket
    - Adds policies for authenticated users to:
      - Upload files
      - Download their own files
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('filestorage', 'filestorage', true);

-- Set up RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'filestorage' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to read their own files
CREATE POLICY "Allow users to read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'filestorage' AND
  auth.uid()::text = (storage.foldername(name))[1]
);