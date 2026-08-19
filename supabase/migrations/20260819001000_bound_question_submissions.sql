-- ===========================================================================
-- Phase 01 — the daily moves in: bound the public question form
-- ===========================================================================
-- The platform baseline reconstructed `question_submissions` from the daily's
-- FIRST migration, which shipped an unbounded `WITH CHECK (true)` insert for
-- anon. The daily then closed that path in
-- `20260529064404_...sql` — dropping the policy and revoking the grant —
-- because an open insert on a table nobody reads is a free write endpoint.
-- The reconstruction lost that correction and reinstated the open version.
--
-- Their replacement was a service-role server function. There is no server
-- runtime here yet, so this takes the shape the daily itself used for the other
-- public form, `lead_captures`: the insert stays public, but the policy carries
-- the validation. Same limits as the server function enforced.
--
-- What the policy buys over the old one:
--   a question must actually be a question (5..4000 characters)
--   a name and a usable email are required, as they were in the server function
--   a submitter cannot set `status` or attach `answered_qa_id` — those belong
--   to the editor answering it, not to the person asking
-- ===========================================================================

DROP POLICY IF EXISTS "Anyone can submit a question" ON public.question_submissions;

CREATE POLICY "Public can submit a bounded question" ON public.question_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(name, '')) BETWEEN 1 AND 120
    AND length(coalesce(email, '')) BETWEEN 3 AND 200
    AND email LIKE '%_@_%'
    AND length(coalesce(question, '')) BETWEEN 5 AND 4000
    AND length(coalesce(context, '')) <= 4000
    AND length(coalesce(user_agent, '')) <= 500
    AND status = 'new'
    AND answered_qa_id IS NULL
  );

-- anon may write one and never read one back; the SELECT policy is admin-only.
REVOKE ALL ON public.question_submissions FROM anon;
GRANT INSERT ON public.question_submissions TO anon;
