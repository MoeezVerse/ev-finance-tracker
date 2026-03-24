
-- Make avatars bucket private
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Drop the old open SELECT policy
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Add authenticated-only SELECT policy
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
