-- ===========================================================================
-- Phase 02 — a renter may create their own prequalification
-- ===========================================================================
-- The rentals site's remediation gave `tenant_prequalification_profiles` a
-- read and an update policy for the owning user, but no insert: on that site
-- the row was always created for an anonymous visitor by a service-role edge
-- function, keyed to a browser session, and claimed onto an account later.
--
-- In the merged app a renter signs in first and prequalifies second, so the
-- common case is a person creating their own row. The insert is scoped the
-- same way the update already is — you may write a row that belongs to you,
-- and no other.
--
-- The anonymous session path is unaffected: service_role bypasses RLS, so if
-- and when that flow moves across it keeps working.
-- ===========================================================================

CREATE POLICY "Users create own prequalification"
ON public.tenant_prequalification_profiles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

GRANT INSERT ON public.tenant_prequalification_profiles TO authenticated;

-- Same reasoning for the contact record a renter creates when enquiring.
CREATE POLICY "Users create own contact"
ON public.tenant_contacts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
