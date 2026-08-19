-- ===========================================================================
-- Applying to a listing
-- ===========================================================================
-- The rentals site's prescreen flow wrote `tenant_screenings` through a
-- service-role edge function, because the applicant was usually anonymous: they
-- filled in a contact form and a screening form on the listing page, and an
-- account was provisioned for them afterwards.
--
-- In the merged app a renter has a profile before they apply — that is the
-- premise — so the common path is a signed-in person recording an application
-- against a listing. They may write a screening that belongs to a contact
-- record that belongs to them, and no other.
--
-- The anonymous path is unaffected: service_role bypasses RLS, so if that flow
-- moves across it keeps working.
-- ===========================================================================

CREATE POLICY "Users create own screenings"
ON public.tenant_screenings
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_contacts c
    WHERE c.id = tenant_screenings.tenant_contact_id
      AND c.user_id = auth.uid()
  )
);

-- A renter reads back the applications they made, so a listing can say "you
-- already applied" instead of offering the button again.
-- (The SELECT policy through the contact already exists.)
