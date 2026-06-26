
REVOKE ALL ON FUNCTION public.enforce_user_roles_admin_only() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_user_roles_admin_only() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_user_roles_admin_only() FROM authenticated;
