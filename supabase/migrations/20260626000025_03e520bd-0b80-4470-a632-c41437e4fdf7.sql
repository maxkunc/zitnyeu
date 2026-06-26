
-- 1) Remove site_content from Realtime publication so row changes
--    aren't broadcast to anonymous subscribers via postgres_changes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'site_content'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.site_content';
  END IF;
END $$;

-- 2) Defense-in-depth trigger on user_roles: even if a future RLS
--    policy were misconfigured, no non-admin can insert/update/delete
--    role rows. Service role (used by backend/edge functions) is allowed.
CREATE OR REPLACE FUNCTION public.enforce_user_roles_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  caller_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  -- Allow trusted server-side contexts (service_role / superuser / no JWT context like SQL migrations).
  IF caller_role = 'service_role' OR caller_role IS NULL OR caller IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Otherwise require the caller to already be an admin.
  IF NOT public.has_role(caller, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only administrators can modify user_roles'
      USING ERRCODE = '42501';
  END IF;

  -- Extra guard: a user can never assign a role to themselves,
  -- even if they somehow already are admin in a compromised flow.
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.user_id = caller THEN
    RAISE EXCEPTION 'Administrators cannot self-assign roles'
      USING ERRCODE = '42501';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS user_roles_admin_only_ins ON public.user_roles;
DROP TRIGGER IF EXISTS user_roles_admin_only_upd ON public.user_roles;
DROP TRIGGER IF EXISTS user_roles_admin_only_del ON public.user_roles;

CREATE TRIGGER user_roles_admin_only_ins
BEFORE INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_roles_admin_only();

CREATE TRIGGER user_roles_admin_only_upd
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_roles_admin_only();

CREATE TRIGGER user_roles_admin_only_del
BEFORE DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_roles_admin_only();
