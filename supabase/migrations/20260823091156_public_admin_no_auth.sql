-- Admin panel no longer requires login (by explicit request) — open up the same access to
-- anon that authenticated previously had, since requests now always run as anon.

-- site_content
GRANT INSERT, UPDATE, DELETE ON public.site_content TO anon;
DROP POLICY IF EXISTS "site_content admin insert" ON public.site_content;
DROP POLICY IF EXISTS "site_content admin update" ON public.site_content;
DROP POLICY IF EXISTS "site_content admin delete" ON public.site_content;
CREATE POLICY "site_content public insert" ON public.site_content
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "site_content public update" ON public.site_content
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "site_content public delete" ON public.site_content
  FOR DELETE TO anon, authenticated USING (true);

-- contact_messages
GRANT SELECT, DELETE ON public.contact_messages TO anon;
DROP POLICY IF EXISTS "contact_messages admin read" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages admin delete" ON public.contact_messages;
CREATE POLICY "contact_messages public read" ON public.contact_messages
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "contact_messages public delete" ON public.contact_messages
  FOR DELETE TO anon, authenticated USING (true);

-- audit_logs
GRANT SELECT, INSERT ON public.audit_logs TO anon;
DROP POLICY IF EXISTS "audit_logs admin read" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs admin insert" ON public.audit_logs;
CREATE POLICY "audit_logs public read" ON public.audit_logs
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "audit_logs public insert" ON public.audit_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- storage: site-images
DROP POLICY IF EXISTS "site-images admin upload" ON storage.objects;
DROP POLICY IF EXISTS "site-images admin update" ON storage.objects;
DROP POLICY IF EXISTS "site-images admin delete" ON storage.objects;
CREATE POLICY "site-images public upload" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "site-images public update" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'site-images') WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "site-images public delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'site-images');

-- realtime: site-sync topic readable by anyone (admin panel is public now)
DROP POLICY IF EXISTS "site-sync topic read authenticated" ON realtime.messages;
CREATE POLICY "site-sync topic read" ON realtime.messages
  FOR SELECT TO anon, authenticated
  USING (realtime.topic() = 'site-sync');
