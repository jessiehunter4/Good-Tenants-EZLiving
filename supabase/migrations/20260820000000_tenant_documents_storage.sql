-- ===========================================================================
-- The application package's documents
-- ===========================================================================
-- Uploading a document has never worked in this app. The code writes to a
-- `tenant-documents` bucket that was never created, and inserts `storage_path`
-- and `bucket_id` columns that are not on the table — so the upload fails, and
-- then the insert fails for a second reason. Both are fixed here.
--
-- The Good Tenants premise is a reusable application package. Until a renter
-- can attach their pay stubs and their ID to it, the package is a set of
-- self-reported bands with nothing behind them, which is the thing landlords
-- actually want to see verified.
--
-- WHO CAN READ A DOCUMENT
--
-- The renter and an admin. That is the whole list, and it is narrower than the
-- rest of the profile deliberately.
--
-- A partner holding a granted access request sees the *package* — income band,
-- credit band, eviction and background status — not the pay stub the band was
-- derived from. That is the line Good Tenants Hub drew (its document policies
-- are owner-or-admin, with no consent path at all) and it is the right one: a
-- band is a statement about a person, a payslip is a document containing their
-- employer, their address and their exact salary. Consent to be assessed is not
-- consent to hand over the file.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. The columns the upload code already writes
-- ---------------------------------------------------------------------------

ALTER TABLE public.application_documents
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS bucket_id text NOT NULL DEFAULT 'tenant-documents';

COMMENT ON COLUMN public.application_documents.storage_path IS
  'Path within the bucket. The first segment is the owner''s user id, which is '
  'what the storage policies match on.';

-- Verification status was free text. These are the only values the app uses.
ALTER TABLE public.application_documents
  DROP CONSTRAINT IF EXISTS application_documents_verification_status_check;
ALTER TABLE public.application_documents
  ADD CONSTRAINT application_documents_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'rejected'));


-- ---------------------------------------------------------------------------
-- 2. A private bucket
-- ---------------------------------------------------------------------------
-- Not public. The existing `content-images` bucket is public because article
-- images are meant to be; an identity document is the opposite of that, and
-- putting one in a public bucket makes it readable by anyone holding the URL,
-- policies or not.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-documents',
  'tenant-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ---------------------------------------------------------------------------
-- 3. Storage policies
-- ---------------------------------------------------------------------------
-- Ownership is the first path segment, matching `generateUserFilePath` in
-- utils/storage.ts. A renter can only reach files under their own id.

DROP POLICY IF EXISTS "Renters read own documents" ON storage.objects;
CREATE POLICY "Renters read own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'tenant-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "Renters upload own documents" ON storage.objects;
CREATE POLICY "Renters upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tenant-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "Renters delete own documents" ON storage.objects;
CREATE POLICY "Renters delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'tenant-documents'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

-- Admins verify what was uploaded, so they read. They do not upload on a
-- renter's behalf, so there is no admin insert.
DROP POLICY IF EXISTS "Admins read tenant documents" ON storage.objects;
CREATE POLICY "Admins read tenant documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'tenant-documents'
    AND public.has_role(auth.uid(), 'admin')
  );
