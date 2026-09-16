BEGIN;

-- Memperbaiki pemeriksaan role setelah profiles.role diganti role_id.
-- Tidak mengubah akun, password, atau role pengguna.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT r.name
    FROM public.profiles AS p
    JOIN public.roles AS r ON r.id = p.role_id
    WHERE p.id = (SELECT auth.uid())
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.roles FROM anon, authenticated;
GRANT SELECT ON public.roles TO authenticated;
DROP POLICY IF EXISTS roles_read ON public.roles;
CREATE POLICY roles_read ON public.roles
FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
COMMIT;
