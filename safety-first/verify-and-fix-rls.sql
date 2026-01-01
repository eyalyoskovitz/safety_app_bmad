-- ============================================================================
-- VERIFY AND FIX RLS FOR USERS TABLE
-- ============================================================================
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- Step 1: Check current RLS status
-- ----------------------------------------------------------------------------
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- Step 2: Re-enable RLS if it was disabled
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies on users table
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can read own role" ON users;
DROP POLICY IF EXISTS "Users can read own user record" ON users;
DROP POLICY IF EXISTS "Authenticated users can view own user data" ON users;
DROP POLICY IF EXISTS "IT admins can manage users" ON users;
DROP POLICY IF EXISTS "IT admins can manage all users" ON users;

-- Step 4: Create simple, working RLS policy for reading own user record
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can read own user record"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 5: Create policy for IT admins to manage all users
-- ----------------------------------------------------------------------------
CREATE POLICY "IT admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'it_admin'
  )
);

-- Step 6: Verify the policies were created successfully
-- ----------------------------------------------------------------------------
SELECT
  policyname,
  cmd as "Command",
  roles as "Roles"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Step 7: Test the policy works (should return YOUR user record)
-- ----------------------------------------------------------------------------
SELECT id, email, role FROM users WHERE id = auth.uid();

-- ============================================================================
-- Expected Result from Step 7:
-- You should see your user record with id, email, and role
-- If it returns instantly, RLS is working correctly!
-- ============================================================================
