
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin');

-- 2. user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. has_role security-definer helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Tighten site_content policies
DROP POLICY IF EXISTS "public read site_content" ON public.site_content;
DROP POLICY IF EXISTS "public write site_content" ON public.site_content;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
CREATE POLICY "site_content public read" ON public.site_content
  FOR SELECT USING (true);
CREATE POLICY "site_content admin insert" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content admin update" ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content admin delete" ON public.site_content
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Tighten contact_messages policies
DROP POLICY IF EXISTS "anyone can read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "anyone can delete messages" ON public.contact_messages;
DROP POLICY IF EXISTS "anyone can submit message" ON public.contact_messages;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
CREATE POLICY "contact_messages public submit" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages admin read" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact_messages admin delete" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Tighten audit_logs policies
DROP POLICY IF EXISTS "anyone can insert logs" ON public.audit_logs;
DROP POLICY IF EXISTS "anyone can read logs" ON public.audit_logs;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
CREATE POLICY "audit_logs admin read" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_logs admin insert" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Storage policies on site-images bucket
DROP POLICY IF EXISTS "public read site-images" ON storage.objects;
DROP POLICY IF EXISTS "public upload site-images" ON storage.objects;
DROP POLICY IF EXISTS "public update site-images" ON storage.objects;
DROP POLICY IF EXISTS "public delete site-images" ON storage.objects;
-- Public bucket still serves files via CDN without an objects SELECT policy.
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

-- 8. Realtime: drop contact_messages from publication; keep site_content public broadcast
ALTER PUBLICATION supabase_realtime DROP TABLE public.contact_messages;

-- 9. Realtime.messages policy — restrict to the public site-sync topic only
DROP POLICY IF EXISTS "site-sync topic read" ON realtime.messages;
CREATE POLICY "site-sync topic read" ON realtime.messages
  FOR SELECT USING (realtime.topic() = 'site-sync');

-- 10. Seed 3 admin users (idempotent)
DO $$
DECLARE
  v_id uuid;
  rec record;
BEGIN
  FOR rec IN (
    SELECT * FROM (VALUES
      ('admin@zitny.eu', 'esa2026', 'admin', 'Hlavní administrátor'),
      ('koordinator@zitny.eu', 'stratos', 'koordinator', 'Koordinátor projektů'),
      ('editor@zitny.eu', 'rocket', 'editor', 'Editor obsahu')
    ) AS t(email, pass, username, display_role)
  ) LOOP
    SELECT id INTO v_id FROM auth.users WHERE email = rec.email;
    IF v_id IS NULL THEN
      v_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, email_change,
        email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
        rec.email, crypt(rec.pass, gen_salt('bf')),
        now(), '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('username', rec.username, 'display_role', rec.display_role),
        now(), now(), '', '', '', ''
      );
      INSERT INTO auth.identities (
        provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        v_id::text, v_id,
        jsonb_build_object('sub', v_id::text, 'email', rec.email),
        'email', now(), now(), now()
      );
    END IF;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'admin')
      ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
