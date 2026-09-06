# Supabase setup

1. Create a project at supabase.com.
2. In the SQL editor, run the files in `migrations/` **in order** (0001 → 0004).
3. Copy the project URL and anon key into `.env.local` (see `.env.local.example`
   at the repo root) — also grab the service role key if you'll seed data
   server-side.
4. Create the one hardcoded admin account and promote it — see
   `seed/00_admin.sql` for the exact steps.
5. In Authentication → URL configuration, add your local dev URL
   (`http://localhost:3000`) and your Vercel deploy URL as allowed redirects.

Schema source of truth is `../revelo-project-spec/data-model.md`. If a
migration here ever needs to diverge from it, that's a bug — fix the
migration, not the spec.
