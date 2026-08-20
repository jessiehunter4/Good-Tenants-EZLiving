-- ===========================================================================
-- Partner verification
-- ===========================================================================
-- The rentals site had a "Get Verified" page for agents and landlords. It
-- collected a licence number, a brokerage and property details — and then did
-- nothing with them: the submit handler says "in production, this would submit
-- to backend for verification" and sets a success message. Nothing was ever
-- stored, so nobody was ever verified.
--
-- It needs no new table. `realtor_profiles` and `landlord_profiles` both
-- already carry `is_verified`, `verification_documents` and `status`; what was
-- missing was somewhere to put the documents and the few fields the form asks
-- for that the profiles do not hold.
--
-- WHY A SECOND BUCKET
--
-- The renter bucket's policies match on the first path segment being the
-- owner's id, which would work for a partner too. But `tenant-documents` holds
-- pay stubs and identity documents under a name that says who they belong to,
-- and mixing a broker's licence into it makes that name a lie — and makes any
-- future policy change to one class of document silently apply to the other.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. The fields the form asks for that the profiles do not hold
-- ---------------------------------------------------------------------------

ALTER TABLE public.realtor_profiles
  ADD COLUMN IF NOT EXISTS brokerage_address text,
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text;

ALTER TABLE public.landlord_profiles
  ADD COLUMN IF NOT EXISTS property_addresses text,
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text;

COMMENT ON COLUMN public.realtor_profiles.verification_submitted_at IS
  'When the partner asked to be verified. Distinct from is_verified, which is '
  'the answer — a null here means they have never asked.';

COMMENT ON COLUMN public.realtor_profiles.verification_notes IS
  'Written by staff when a submission is refused, so the partner is told why '
  'rather than left to guess.';


-- ---------------------------------------------------------------------------
-- 2. A private bucket for licences and proof of ownership
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-documents',
  'partner-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Partners read own documents" ON storage.objects;
CREATE POLICY "Partners read own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'partner-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "Partners upload own documents" ON storage.objects;
CREATE POLICY "Partners upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'partner-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "Partners delete own documents" ON storage.objects;
CREATE POLICY "Partners delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'partner-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Staff read them to decide. They do not upload on a partner's behalf.
DROP POLICY IF EXISTS "Admins read partner documents" ON storage.objects;
CREATE POLICY "Admins read partner documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'partner-documents'
    AND public.has_role(auth.uid(), 'admin')
  );


-- ---------------------------------------------------------------------------
-- 3. A partner cannot verify themselves
-- ---------------------------------------------------------------------------
-- The existing "Owners manage" policies are FOR ALL, so a partner could set
-- their own `is_verified` and `status` with one request — which would make the
-- badge on their directory listing worth nothing. The verdict columns are now
-- staff-only, while everything else on the profile stays theirs to edit.

CREATE OR REPLACE FUNCTION public.guard_partner_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Staff and the service role may set the verdict.
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    RAISE EXCEPTION 'Only staff can decide whether a partner is verified';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Only staff can change a partner''s status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS realtor_verification_guard ON public.realtor_profiles;
CREATE TRIGGER realtor_verification_guard
  BEFORE UPDATE ON public.realtor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_partner_verification();

DROP TRIGGER IF EXISTS landlord_verification_guard ON public.landlord_profiles;
CREATE TRIGGER landlord_verification_guard
  BEFORE UPDATE ON public.landlord_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_partner_verification();
