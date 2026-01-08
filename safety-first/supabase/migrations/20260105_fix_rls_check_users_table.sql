-- Fix RLS policies to check role from users table instead of JWT metadata
-- The role is stored in public.users table, not in auth JWT token

-- ============================================================================
-- INCIDENTS TABLE POLICIES - Check users table for role
-- ============================================================================

-- Drop all old incident policies
DROP POLICY IF EXISTS "IT admins can manage all incidents" ON incidents;
DROP POLICY IF EXISTS "Managers can manage incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can view all incidents" ON incidents;
DROP POLICY IF EXISTS "IT admins can delete incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view assigned incidents" ON incidents;
DROP POLICY IF EXISTS "Managers can update assigned incidents" ON incidents;
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
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'it_admin'
    )
  );

-- 3. UPDATE policy for Managers (can manage all incidents for assignment/resolution)
CREATE POLICY "Managers can manage incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
    )
  );

-- 4. DELETE policy - Only IT Admins can delete incidents
CREATE POLICY "IT admins can delete incidents"
  ON incidents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'it_admin'
    )
  );

-- ============================================================================
-- USERS TABLE POLICIES - Check users table for role
-- ============================================================================

-- Drop old user policies
DROP POLICY IF EXISTS "IT admins can manage all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;
DROP POLICY IF EXISTS "IT admins can manage users" ON users;

-- IT Admins can manage all users (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "IT admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'it_admin'
    )
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
-- These policies now check the public.users table for the role, not the JWT token
-- This ensures the users table is the single source of truth for roles
