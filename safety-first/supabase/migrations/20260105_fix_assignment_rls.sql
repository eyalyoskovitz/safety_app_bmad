-- Fix RLS policy to allow managers and admins to assign/manage incidents
-- The existing policy only allows updating incidents already assigned to the user
-- We need to allow managers and IT admins to UPDATE any incident for assignment purposes

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Managers can update assigned incidents" ON incidents;

-- Create new policies with proper permissions

-- 1. IT Admins can update ANY incident (full management)
CREATE POLICY "IT admins can manage all incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'it_admin'
  );

-- 2. Managers can update ANY incident (for assignment and resolution)
CREATE POLICY "Managers can manage incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'manager'
  );
