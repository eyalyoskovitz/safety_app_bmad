-- Comprehensive migration to update all roles to use only 'manager' and 'it_admin'
-- Removes references to 'safety_officer' and 'plant_manager' roles

-- ============================================================================
-- INCIDENTS TABLE POLICIES
-- ============================================================================

-- Drop all old incident policies
DROP POLICY IF EXISTS "Managers can update assigned incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view assigned incidents" ON incidents;
DROP POLICY IF EXISTS "Safety officers can delete incidents" ON incidents;

-- 1. SELECT policy - All authenticated users can view all incidents
CREATE POLICY "Authenticated users can view all incidents"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. UPDATE policy for IT Admins (full access)
CREATE POLICY "IT admins can manage all incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'it_admin'
  );

-- 3. UPDATE policy for Managers (can manage all incidents for assignment/resolution)
CREATE POLICY "Managers can manage incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'manager'
  );

-- 4. DELETE policy - Only IT Admins can delete incidents
CREATE POLICY "IT admins can delete incidents"
  ON incidents
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'it_admin'
  );

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Drop old user policies
DROP POLICY IF EXISTS "IT admins can manage users" ON users;

-- IT Admins can manage all users (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "IT admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'it_admin'
  );

-- All authenticated users can view all users (needed for assignment dropdowns)
CREATE POLICY "Authenticated users can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================
-- Valid roles are now: 'manager', 'it_admin'
-- - manager: Can assign incidents to other managers, update/resolve incidents
-- - it_admin: Full system access, user management
