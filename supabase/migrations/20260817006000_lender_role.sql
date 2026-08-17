-- Adds the lender account type.
--
-- Alone in its own migration on purpose: Postgres will not let a value added by
-- ALTER TYPE ... ADD VALUE be used in the same transaction that added it, and
-- the lending tables that follow reference 'lender' in their policies.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lender';
