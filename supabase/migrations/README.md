# Migrations

**This directory was empty.** The database was built through the Lovable/Supabase
dashboard, so none of the schema is in version control. The 17 tables are visible
only as generated types in `src/integrations/supabase/types.ts`.

That has three consequences worth stating plainly:

1. **RLS cannot be reviewed.** Nobody can tell from this repository whether
   `tenant_profiles`, `application_documents`, or `messages` are protected at
   all — and they hold household income, uploaded documents, and private
   correspondence.
2. **The database cannot be reproduced.** There is no way to stand up a staging
   or local copy that matches production.
3. **Changes cannot be reviewed or rolled back**, because they leave no diff.

## Step 1 — capture a baseline (do this first)

Everything else is blocked behind this. With the Supabase CLI, linked to the
project:

```sh
supabase login
supabase link --project-ref <project-ref>

# Schema only — no rows. Safe to commit.
supabase db dump --schema public --data-only=false \
  -f supabase/migrations/00000000000000_baseline_schema.sql

# Policies and grants live outside --schema public in some setups; verify the
# dump actually contains your CREATE POLICY statements before trusting it:
grep -c "CREATE POLICY" supabase/migrations/00000000000000_baseline_schema.sql
```

Read the result before committing it. Confirm in particular that every table
holding tenant data has `ENABLE ROW LEVEL SECURITY` and at least one policy —
a table with RLS enabled and no policy denies everything, and a table with no
RLS at all is wide open to any role holding a grant.

## Step 2 — then apply the hardening migration

`20260812000000_harden_role_assignment.sql` in this directory addresses the
client-assignable account role. **It is written against the schema inferred from
`types.ts` and has not been run.** Verify the object names against the baseline
from step 1 before applying it.

## Note on this app's lifecycle

Per the build plan, Good Tenants is to be **absorbed and retired** — its features
rebuilt in the host app, its data migrated, the app switched off. That is a
reason to keep investment here minimal, but not a reason to skip the baseline:
you cannot safely migrate data whose schema and access rules you cannot see.
