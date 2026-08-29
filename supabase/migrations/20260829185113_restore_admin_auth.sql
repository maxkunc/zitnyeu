-- Revert public_admin_no_auth: admin panel requires login again, so gate writes/reads
-- back to authenticated + has_role('admin') as they were before that change.

-- site_content
REVOKE INSERT, UPDATE, DELETE ON public.site_content FROM anon;
DROP POLICY IF EXISTS "site_content public insert" ON public.site_content;
DROP POLICY IF EXISTS "site_content public update" ON public.site_content;
DROP POLICY IF EXISTS "site_content public delete" ON public.site_content;
CREATE POLICY "site_content admin insert" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content admin update" ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content admin delete" ON public.site_content
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- contact_messages
REVOKE SELECT, DELETE ON public.contact_messages FROM anon;
DROP POLICY IF EXISTS "contact_messages public read" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages public delete" ON public.contact_messages;
CREATE POLICY "contact_messages admin read" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact_messages admin delete" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- audit_logs
REVOKE SELECT, INSERT ON public.audit_logs FROM anon;
DROP POLICY IF EXISTS "audit_logs public read" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs public insert" ON public.audit_logs;
CREATE POLICY "audit_logs admin read" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_logs admin insert" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- storage: site-images
DROP POLICY IF EXISTS "site-images public upload" ON storage.objects;
DROP POLICY IF EXISTS "site-images public update" ON storage.objects;
DROP POLICY IF EXISTS "site-images public delete" ON storage.objects;
CREATE POLICY "site-images admin upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site-images admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site-images admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- realtime: site-sync topic back to authenticated admins only
DROP POLICY IF EXISTS "site-sync topic read" ON realtime.messages;
CREATE POLICY "site-sync topic read authenticated"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    (realtime.topic() = 'site-sync')
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );
