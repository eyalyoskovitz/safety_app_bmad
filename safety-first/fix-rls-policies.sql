-- ============================================================================
-- FIX RLS POLICIES FOR SAFETY FIRST APP
-- ============================================================================
-- This script fixes Row Level Security policies to allow proper access
-- Run this in Supabase SQL Editor if you experience hanging queries
-- ============================================================================

-- Step 1: Check current RLS status
-- ----------------------------------------------------------------------------
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'incidents');

-- Step 2: Drop any existing conflicting policies on users table
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own role" ON users;
DROP POLICY IF EXISTS "Authenticated users can view own user data" ON users;
DROP POLICY IF EXISTS "Users can read own user record" ON users;

-- Step 3: Create correct RLS policy for users table
-- ----------------------------------------------------------------------------
-- This allows authenticated users to read their own user record (including role)
CREATE POLICY "Users can read own user record"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

COMMENT ON POLICY "Users can read own user record" ON users IS
'Allows authenticated users to read their own user record, including their role. Required for role-based route protection.';

-- Step 4: Verify the policy was created successfully
-- ----------------------------------------------------------------------------
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command",
  qual as "USING clause"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ============================================================================
-- EXPECTED OUTPUT:
-- You should see a policy named "Users can read own user record"
-- with cmd = 'SELECT' and USING clause = (auth.uid() = id)
-- ============================================================================

-- Optional: Test the policy works
-- ----------------------------------------------------------------------------
-- This should return YOUR user record (run while logged in)
SELECT id, email, role FROM users WHERE id = auth.uid();

-- If the above query returns your user with role, the policy works! ✅
-- ============================================================================
