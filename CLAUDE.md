# Good-Tenants-EZLiving — working conventions

The merged platform: EZ Living Irvine, Irvine Living Daily, Coming Soon Home
Rentals and Good Tenants in one application on one Supabase project.

## This is a merge, not a new build

Four working applications are being combined into this one:

| App | Repo | What it is |
| --- | --- | --- |
| Coming Soon Home Rentals | `comingsoonhomrentals-com` | The listings. MLS ingestion, search, listing detail, showings. 77 migrations, 49 edge functions, live users |
| EZ Living Irvine | `Irvine Living Daily` | The daily. Content, topics, an admin CMS and an AI article pipeline. 34 routes, 15 migrations |
| Good Tenants Hub | `Good Tenants Hub` | GoodTenants.com itself. The brand site and the reusable application package. 23 routes, 4 migrations |
| Good Tenants | this repo | The MVP this merge is built in. Tenant directory, screening, dashboards |

A fifth, `ezliving`, was an earlier attempt at this same merge on Next.js. Its
own README said nothing had ever run against a real database, and it had not —
`/properties` failed on a table that was never created anywhere. It was deleted
on 19 August 2026, after its fair housing lint, its featured-selection engine
and its ops health module were carried across. Two modules were let go with it:
its prequalification rule, superseded by `features/tenant/qualification.ts`, and
its round-robin agent assignment, which depends on a leasing-agent concept this
app does not have.

**Look in those repos before writing anything.** They have working copy, working
schema and a working funnel. The default is to carry across what exists and adapt
it, not to design a fourth version of it — and where a decision was already made
there, the burden is on changing it, not on keeping it.

That applies to design as much as code. The landing page was once written from an
unrelated reference site while both apps being merged already had landing pages,
their own value propositions and their own FAQ. The result was plausible and
wrong.

**Carry the source with it.** When copy, a rule or a schema comes from one of the
three, say so in a comment or a `source` field. It is the difference between "we
decided this" and "this is what the live site says", which matters when a claim
turns out to be a marketing number nobody has checked.

## One question, one answer

Three apps asked overlapping questions in different words. Where two of them
turn out to be the same question, they get one answer in one place — that is
what the merge is for. Where they turn out to be *different* questions wearing
similar names, they stay apart and the code says why.

Settled so far:

- **Qualification** — would a landlord approve this renter — is
  `features/tenant/qualification.ts`, and nowhere else.
- **Fit** — does this home suit what they asked for — is
  `calculate_match_score`. A renter can qualify for a home that suits them
  badly, so this is not the same question.
- **Verification** — have we checked their documents — is
  `tenant_profiles.screening_status`. Also not the same question.
- **The renter profile** is `tenant_profiles`.
  `tenant_prequalification_profiles` is only where an anonymous visitor's
  answers land before they have an account.

Not settled yet — Good Tenants Hub splits the renter profile in two, and its
version is better than the one here:

- `tenant_public_profiles` is what a landlord browsing the directory sees, with
  a per-field switch for each sensitive band — `share_rent_range`,
  `share_credit_band`, `share_income_band` — plus `is_published` and
  `admin_approved_at`.
- `tenant_private_packages` holds the income band, credit band, eviction and
  background status and rental history, released only through a granted
  request.

This app has one table and one all-or-nothing consent flag. The hub lets a
renter show their rent range without showing their credit band, which is a
distinction worth having and is not expressible here. Reconciling the two is
the open question, not whether to.

## Build to be changed, not just to run

Every decision here is about the fourth month, not the first week.

- **No file over 800 lines.** At 400 it needs a reason; at 800 it gets split.
  A long file is not a style problem, it is a file nobody can hold in their head,
  which is where bugs go to hide.
- **One responsibility per module.** A page composes; a component renders; a hook
  fetches; a pure module decides. When those blur, none of them can be tested or
  reused.
- **Extract logic from hooks the moment it has a decision in it.** Counting,
  bucketing, scoring and parsing belong in pure functions that take arguments and
  return values. A rule buried in a `useEffect` cannot be tested without a
  database, which is exactly how two counters shipped returning `NaN`.

## Structure

```
src/
  pages/          route-level composition only, no business rules
  components/
    <feature>/    feature components, colocated
    ui/           shadcn primitives — copied in, restyled, not hand-edited
  hooks/
    <feature>/    data fetching and React state
  features/
    <feature>/    pure domain logic, types, vocabulary
  types/          shapes shared across features
  lib/            cross-cutting helpers
supabase/migrations/   one baseline, then forward-only
```

Feature work adds to `features/` and `components/<feature>/` rather than growing
a shared file. If two features need the same thing, it moves to `lib/` or
`types/` deliberately — not by import creep.

## TypeScript

- **`strict` is on, and stays on.** It was off for a long time, which made most
  of the rules below unenforceable: with `strictNullChecks` off every zod schema
  infers as all-optional and every `| null` is decorative. If a change seems to
  need it turned off, the change is wrong.
- **Never `any`.** Not in props, not in a reducer accumulator, not as `as any`.
  Derive from the generated database types so a schema change is a compile error
  rather than `undefined` at runtime.
- Model absence honestly. If the database can return null, the type says null and
  the UI handles it. A role that is null is an account with no role, not a tenant.
- Prefer `unknown` plus a type guard over a cast.

## Database

- Every new table ships GRANTs, `ENABLE ROW LEVEL SECURITY` and its policies **in
  the same migration**. Supabase's default privileges grant `anon` everything, so
  a table without explicit grants is open, not closed.
- No policy with `USING (true)` on anything holding personal data — temporarily
  or otherwise.
- Money is `numeric`, never float. Totals that can be derived are generated
  columns, so a stored total cannot disagree with its own inputs.
- Migrations are forward-only. Never edit one that has been applied.
- **Regenerate `src/integrations/supabase/types.ts` after every migration**, with
  `python3 scripts/gen-supabase-types.py > src/integrations/supabase/types.ts`.
  The Supabase CLI does this too, but it shells out to Docker, which is not
  available here. A stale types file is worse than no types file: it compiles
  against a schema that no longer exists.
- The generated types are what makes `supabase.from(...)` safe. If a table name
  that does not exist ever type-checks, the typing has silently degraded to
  `any` somewhere — check that every value assigned to the client is
  `SupabaseClient<Database>`, including test doubles and dev stubs.

## UI

- **Colour comes from tokens** in `index.css` — `brand`, `role-*`, and the shadcn
  set. Never a literal like `bg-slate-900` or `text-blue-300`: a literal is a
  colour that cannot be changed anywhere but the file it is written in.
- Use the shadcn primitives already in `components/ui`. Scope `dark` to a subtree
  rather than restyling controls.
- Every list has an empty state, every async view has a loading state, and every
  destructive action asks first — in a dialog, never `window.confirm`.
- Feedback is a toast, not an alert.

## Testing

Minimal and targeted, not comprehensive. Test the logic that decides things:
parsers, counters, scoring, money. Skip component and snapshot tests. If a bug
is found in pure logic, add the case that would have caught it — one test, then
move on.

`npm test` runs them.

## Before saying something works

Run it. `npm run build` for compilation, `npm test` for logic, and a real query
against the project for anything touching the database. A migration that applied
is not the same as a policy that behaves.
