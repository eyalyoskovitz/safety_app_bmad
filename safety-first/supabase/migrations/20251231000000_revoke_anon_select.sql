-- SECURITY FIX: Revoke SELECT permission on incidents from anon role
-- This fixes a security issue where anonymous users could read incident data
--
-- Background: The fix-anon-permissions.sql script incorrectly granted SELECT
-- permission to anon. This migration revokes it to restore proper security.
--
-- Expected behavior after this migration:
-- - Anonymous users CAN insert incidents (anonymous reporting)
-- - Anonymous users CANNOT select/read incidents (privacy protection)

-- Revoke SELECT permission from anon role
REVOKE SELECT ON public.incidents FROM anon;

-- Verify the grant was removed (this will error if already revoked, which is fine)
-- The above REVOKE is idempotent and safe to run multiple times
