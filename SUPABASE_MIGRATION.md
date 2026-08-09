# Firestore to Supabase migration

Firebase Authentication and Firebase App Check remain in use. Only Firestore is replaced by Supabase Postgres.

## Required environment values

Copy `.env.example` to `.env.local` for local development and set:

- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: browser-safe Supabase publishable key.
- `SUPABASE_URL`: the same project URL, used by the server and migration script.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service-role key. Never use a `VITE_` prefix for this value.
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Firebase service-account JSON serialized on one line.

Keep the existing Firebase Authentication, App Check, Cloudinary and Gemini values.

## Database setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it once.
3. Open **Authentication → Third-Party Auth**, add Firebase, and enter the Firebase Project ID.
4. Assign the Firebase custom claim `role: "authenticated"` to existing and future users as described in Supabase's Firebase Auth documentation.

## Transfer data

Run:

```sh
npm run migrate:supabase
```

The script reads all seven Firestore collections, normalizes their data into the relational tables, preserves document IDs, and verifies row counts. It does not update or delete Firestore data. It is safe to rerun because base records are upserted by their stable IDs.

If the script reports a broken property relationship, fix the orphaned Firestore reference and rerun. No referenced row is silently discarded.

## Validation

Run:

```sh
npm run lint
npm run build
```

After production verification, Firestore can be disabled separately in the Firebase Console. Do not disable Firebase Authentication or App Check.
