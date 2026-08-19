DROP POLICY IF EXISTS "auth read message-media" ON storage.objects;

CREATE POLICY "read own message-media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'message-media' AND owner = auth.uid());