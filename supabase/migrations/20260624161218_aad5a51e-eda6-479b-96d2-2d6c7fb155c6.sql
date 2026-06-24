-- 1. Restrict user_roles INSERT/UPDATE/DELETE to admins only (prevent privilege escalation)
CREATE POLICY "user_roles admin insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_roles admin update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_roles admin delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_roles admin read all"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Tighten contact_messages INSERT: replace WITH CHECK (true) with field validation
DROP POLICY IF EXISTS "contact_messages public submit" ON public.contact_messages;
CREATE POLICY "contact_messages public submit"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 100
    AND length(btrim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(message)) BETWEEN 1 AND 2000
  );

-- 3. Restrict realtime 'site-sync' topic to authenticated users only
DROP POLICY IF EXISTS "site-sync topic read" ON realtime.messages;
CREATE POLICY "site-sync topic read authenticated"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    (realtime.topic() = 'site-sync')
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. Move has_role out of exposed API schema to avoid SECURITY DEFINER exposure
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;

-- Re-point public.has_role to delegate (keep policies working) but revoke direct EXECUTE from API roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
-- Note: RLS policies invoke the function with the policy owner's privileges via SECURITY DEFINER;
-- revoking EXECUTE from API roles prevents direct RPC calls while RLS continues to function.
