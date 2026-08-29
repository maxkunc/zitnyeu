# Supabase backend

Project: `ecacuvajvbfgmsrqpnye` (see `config.toml` / the repo's `.env`).

`migrations/` creates the schema and its RLS policies in three steps:

1. `20260823090135_zitny_schema.sql` — tables, the `has_role()` helper, and admin-only RLS
   policies gated on `auth.users` / `user_roles`.
2. `20260823091156_public_admin_no_auth.sql` — briefly made `/admin` public (no login), by
   request.
3. `20260829185113_restore_admin_auth.sql` — reverted step 2: `/admin` requires login again,
   and RLS is back to authenticated + `has_role('admin')` only.

The 3 admin accounts (`admin` / `koordinator` / `editor` @zitny.eu) already exist in this
project's `auth.users` with the `admin` role — they were seeded when the project was
created and were never removed, so the same login credentials still work. Passwords are
**not** stored in this repo (never commit plaintext passwords to migrations). To rotate or
recreate an account, run something like this in the Supabase SQL Editor instead:

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

The frontend (`src/lib/site-store.ts`) maps the login usernames `admin` / `koordinator` /
`editor` to these three email addresses — the emails must match if you add or rename
accounts.
