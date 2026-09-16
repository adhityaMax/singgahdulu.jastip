BEGIN;
-- Jalankan setelah migrasi normalize_roles.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
UPDATE public.profiles p SET username =
    CASE WHEN u.email ~ '^[a-z0-9_]{3,40}@users[.]singgahdulu[.]invalid$'
         THEN split_part(u.email, '@', 1)
         ELSE 'user_' || replace(p.id::text, '-', '') END
FROM auth.users u WHERE p.id = u.id AND p.username IS NULL;
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_username_format') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]{3,40}$');
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, username, role_id)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Pengguna'),
        CASE WHEN NEW.email ~ '^[a-z0-9_]{3,40}@users[.]singgahdulu[.]invalid$'
             THEN split_part(NEW.email, '@', 1)
             ELSE 'user_' || replace(NEW.id::text, '-', '') END,
        (SELECT id FROM public.roles WHERE name = 'driver'))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
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
