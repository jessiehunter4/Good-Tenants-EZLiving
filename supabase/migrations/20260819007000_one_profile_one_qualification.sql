-- ===========================================================================
-- Phase 03 — one profile, one qualification
-- ===========================================================================
-- Until now the merged app has held a renter's answers twice.
--
--   tenant_profiles                  household_income, household_size,
--   (Good Tenants)                   max_monthly_rent, min_bedrooms,
--                                    min_bathrooms, pets, desired_cities,
--                                    desired_move_date, move_in_date
--
--   tenant_prequalification_profiles household_income, num_adults,
--   (the rentals site)               num_children, has_pets, num_pets,
--                                    credit_score_estimate, earliest_move_date,
--                                    latest_move_date, max_rent, min_bedrooms
--
-- Almost every field appears in both. A renter who onboarded through Good
-- Tenants and then prequalified on a listing answered the same questions twice
-- and got two rows that could disagree with each other.
--
-- `tenant_profiles` becomes the one profile. It is the older concept, it is
-- what the landlord directory reads, it is what the consent flow governs, and
-- it already carries everything except the three things the rentals side asked
-- and it did not: an estimate of credit, how many pets, and the earliest date
-- the renter could actually move.
--
-- WHAT IS NOT BEING MERGED, AND WHY
--
-- `calculate_match_score` looks like a third answer to the same question. It is
-- not. It scores *fit* — does this home suit what they asked for, on budget,
-- bedrooms, city and pets — which is a different question from *qualification*,
-- would a landlord approve them, on income and credit. A renter can qualify for
-- a home that suits them badly, and want one they cannot afford. Collapsing the
-- two would lose a distinction both sites rely on, so it keeps its own name and
-- gains a comment saying so.
--
-- `tenant_prequalification_profiles` is not dropped. It is what an anonymous
-- visitor's answers land in, keyed by browser session, before there is an
-- account to attach them to — that flow needs a service-role path that has not
-- moved across yet. It stops being a second home for a signed-in renter's
-- answers, and its comment now says which of the two it is.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. The three fields the one profile was missing
-- ---------------------------------------------------------------------------

ALTER TABLE public.tenant_profiles
  ADD COLUMN IF NOT EXISTS credit_score_estimate text
    CHECK (credit_score_estimate IS NULL OR credit_score_estimate IN
      ('excellent', 'good', 'fair', 'poor', 'not_sure')),
  ADD COLUMN IF NOT EXISTS num_pets integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS earliest_move_date date;

COMMENT ON COLUMN public.tenant_profiles.credit_score_estimate IS
  'Self-reported band, not a pulled score. A failure against it is phrased as '
  '"may not meet" for that reason.';

COMMENT ON COLUMN public.tenant_profiles.earliest_move_date IS
  'The first date the renter could move. `desired_move_date` is when they would '
  'like to; qualification uses this one, because it is the one a landlord cares '
  'about.';

-- Backfill from what the profile already knows, so an existing renter does not
-- have to answer again: their move-in date is the best evidence available of
-- the earliest they could move.
UPDATE public.tenant_profiles
SET earliest_move_date = coalesce(move_in_date, desired_move_date)
WHERE earliest_move_date IS NULL
  AND coalesce(move_in_date, desired_move_date) IS NOT NULL;

-- And from a prequalification the same person already completed, which is the
-- whole point: they answered it once.
UPDATE public.tenant_profiles t
SET credit_score_estimate = coalesce(t.credit_score_estimate, p.credit_score_estimate),
    num_pets              = greatest(t.num_pets, coalesce(p.num_pets, 0)),
    earliest_move_date    = coalesce(t.earliest_move_date, p.earliest_move_date),
    household_income      = coalesce(t.household_income, p.household_income),
    max_monthly_rent      = coalesce(t.max_monthly_rent, p.max_rent),
    min_bedrooms          = coalesce(t.min_bedrooms, p.min_bedrooms),
    pets                  = coalesce(t.pets, p.has_pets)
FROM public.tenant_prequalification_profiles p
WHERE p.user_id = t.id;


-- ---------------------------------------------------------------------------
-- 2. Say which table is which
-- ---------------------------------------------------------------------------

COMMENT ON TABLE public.tenant_profiles IS
  'The one renter profile. Everything a renter tells us about themselves lives '
  'here, and a landlord sees it only through a granted directory_access_request.';

COMMENT ON TABLE public.tenant_prequalification_profiles IS
  'Anonymous prequalification, keyed by browser session, for a visitor with no '
  'account yet. A signed-in renter''s answers belong in tenant_profiles.';

COMMENT ON FUNCTION public.calculate_match_score(uuid, uuid) IS
  'Fit, not qualification: how well a listing suits what a renter asked for. '
  'Whether a landlord would approve them is a different question, answered by '
  'the qualification rule in src/features/tenant/qualification.ts.';


-- ---------------------------------------------------------------------------
-- 3. Pre-screened stops being a free-floating flag
-- ---------------------------------------------------------------------------
-- `is_pre_screened` was set by hand and read by the landlord directory, with
-- nothing deciding it. It now means one thing: the profile holds enough for the
-- qualification rule to reach a verdict — income, a credit band and a date.
-- A generated column keeps it that way, so it cannot drift from the answers it
-- claims to summarise.

ALTER TABLE public.tenant_profiles
  DROP COLUMN IF EXISTS is_pre_screened;

ALTER TABLE public.tenant_profiles
  ADD COLUMN is_pre_screened boolean
  GENERATED ALWAYS AS (
    household_income IS NOT NULL
    AND credit_score_estimate IS NOT NULL
    AND earliest_move_date IS NOT NULL
  ) STORED;

COMMENT ON COLUMN public.tenant_profiles.is_pre_screened IS
  'Derived: the profile holds enough to be qualified against a listing. It was '
  'a hand-set flag that nothing computed and the landlord directory believed.';
