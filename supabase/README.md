# Supabase backend

Project: `ecacuvajvbfgmsrqpnye` (see `config.toml` / the repo's `.env`).

`migrations/` creates the schema (tables, RLS policies, the `has_role` helper, the
`site-images` storage bucket). It does **not** seed admin accounts — auth users with
plaintext passwords shouldn't go into git. To (re)create/rotate the admin accounts,
run something like this in the Supabase Dashboard → SQL Editor instead:

```sql
DO $$
DECLARE
  v_id uuid;
  rec record;
BEGIN
  FOR rec IN (
    SELECT * FROM (VALUES
      ('admin@zitny.eu', '<new-password>', 'admin', 'Hlavní administrátor'),
      ('koordinator@zitny.eu', '<new-password>', 'koordinator', 'Koordinátor projektů'),
      ('editor@zitny.eu', '<new-password>', 'editor', 'Editor obsahu')
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

The frontend (`src/lib/site-store.ts`) maps the login usernames `admin` / `koordinator` /
`editor` to these three email addresses — the emails must match if you add or rename
accounts.
