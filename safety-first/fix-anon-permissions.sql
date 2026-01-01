-- Comprehensive fix for anonymous incident reporting
-- This grants all necessary permissions for the anon role
-- SECURITY NOTE: Anonymous users can INSERT incidents but CANNOT SELECT them

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on incidents table
GRANT INSERT ON public.incidents TO anon;
-- REMOVED: GRANT SELECT ON public.incidents TO anon
-- Anonymous users should NOT be able to read incidents (privacy/security)
-- Use Prefer: return=minimal in REST or omit .select() in JS client

-- Grant permissions on plant_locations (needed for foreign key validation)
GRANT SELECT ON public.plant_locations TO anon;

-- Grant permissions on sequences (needed for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Recreate the RLS policy to be absolutely explicit
DROP POLICY IF EXISTS "Anyone can submit incidents" ON public.incidents;

CREATE POLICY "Anyone can submit incidents"
  ON public.incidents
  FOR INSERT
  TO anon
  WITH CHECK (true);
