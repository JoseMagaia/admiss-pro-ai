
CREATE POLICY "auth read message-media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'message-media');

CREATE POLICY "auth upload message-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-media');

CREATE POLICY "auth delete own message-media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'message-media' AND owner = auth.uid());
