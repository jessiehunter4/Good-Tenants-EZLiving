-- ===========================================================================
-- public.users: report no role as no role
-- ===========================================================================
-- The view defaulted a roleless account to 'tenant'. That was convenient and
-- wrong: an account with no row in user_roles is not a tenant, it is an account
-- with no role — which is exactly what a signup asserting `admin` now produces.
--
-- Defaulting it hands such an account a tenant dashboard, no tenant profile row
-- to fill it, and no explanation. Worse, it makes "role" a value that is never
-- absent, so no caller ever has to handle the case, and the one account type
-- that most needs handling is the one being disguised.
--
-- The view now returns NULL. Callers that route on role must decide what an
-- account with none is allowed to see; the honest answer is the public site.

CREATE OR REPLACE VIEW public.users WITH (security_invoker = on) AS
  SELECT
    p.id,
    p.email,
    (SELECT CASE WHEN r.role = 'realtor' THEN 'agent' ELSE r.role::text END
       FROM public.user_roles r
      WHERE r.user_id = p.id
      ORDER BY CASE r.role
                 WHEN 'admin' THEN 1 WHEN 'editor' THEN 2 WHEN 'landlord' THEN 3
                 WHEN 'realtor' THEN 4 ELSE 5 END
      LIMIT 1) AS role,
    p.created_at,
    p.updated_at
  FROM public.profiles p;

GRANT SELECT ON public.users TO authenticated;
