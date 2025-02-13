/*
  # Update storage policies

  1. Changes
    - Add policy for deleting files
    - Update existing policies to be more specific
    - Add policy for updating files

  2. Security
    - Maintain RLS enforcement
    - Ensure users can only manage their own files
*/

-- Policy to allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'filestorage' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'filestorage' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'filestorage' AND
  auth.uid()::text = (storage.foldername(name))[1]
);