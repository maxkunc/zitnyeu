# Supabase backend

Project: `ecacuvajvbfgmsrqpnye` (see `config.toml` / the repo's `.env`).

`migrations/` creates the schema (tables, RLS policies, storage bucket) in two steps:

1. `20260823090135_zitny_schema.sql` — tables, the `has_role()` helper, and (unused by the
   app now, see below) admin-only RLS policies gated on `auth.users` / `user_roles`.
2. `20260823091156_public_admin_no_auth.sql` — the admin panel (`/admin`) was made public,
   by request: no login screen, so requests always run as the Supabase `anon` role. This
   migration replaces the admin-only policies from step 1 with open ones so `anon` can read
   and write everything the admin panel needs (site content, contact messages, audit log,
   image uploads).

**Anyone who can reach `/admin` can edit the site, delete visitor messages, and read the
audit log.** There is no authentication layer at all — this was an explicit, confirmed
trade-off, not an oversight. To re-add a login gate later, restore `auth`/`role`/`login`/
`logout` in `useAuth()` (`src/lib/site-store.ts`) and reinstate `has_role()`-gated RLS
policies (see step 1's migration for the pattern, and `git log` for the removed
`LoginScreen` component in `src/routes/admin.tsx`).

The 3 accounts seeded in the previous version of this project (`admin` / `koordinator` /
`editor` @zitny.eu) are **not** carried over here — they were never re-created in this
project. If auth is reinstated, seed accounts via the Supabase SQL Editor (never commit
plaintext passwords to migrations):

```sql
DO $$
DECLARE
  v_id uuid;
  rec record;
BEGIN
  FOR rec IN (
    SELECT * FROM (VALUES
      ('admin@zitny.eu', '<new-password>', 'admin', 'Hlavní administrátor')
      -- add more (email, password, username, display_role) rows as needed
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
    ELSE
      UPDATE auth.users
      SET encrypted_password = crypt(rec.pass, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = v_id;
    END IF;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_id, 'admin')
      ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
```
