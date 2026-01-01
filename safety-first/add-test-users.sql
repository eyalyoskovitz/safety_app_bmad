-- Add Test Users to users table
-- Run this in Supabase SQL Editor

-- IMPORTANT: Replace the UUIDs below with the actual UUIDs from your auth.users table
-- To find UUIDs: Go to Supabase Dashboard → Authentication → Users → Click on user → Copy ID

-- Step 1: Find your user IDs
-- Run this query first to see your auth users:
SELECT id, email FROM auth.users WHERE email IN ('manager@safety-first.com', 'admin@safety-first.com');

-- Step 2: Copy the UUIDs from the results above and paste them below
-- Then run the INSERT statements

-- Insert Manager user
-- REPLACE 'your-manager-uuid-here' with actual UUID from Step 1
INSERT INTO users (id, email, full_name, role)
VALUES (
  'your-manager-uuid-here',  -- REPLACE THIS!
  'manager@safety-first.com',
  'Test Manager',
  'manager'
)
ON CONFLICT (id) DO UPDATE SET role = 'manager';

-- Insert IT Admin user
-- REPLACE 'your-admin-uuid-here' with actual UUID from Step 1
INSERT INTO users (id, email, full_name, role)
VALUES (
  'your-admin-uuid-here',  -- REPLACE THIS!
  'admin@safety-first.com',
  'Test IT Admin',
  'it_admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'it_admin';

-- Step 3: Verify the users were added correctly
SELECT id, email, role FROM users WHERE email IN ('manager@safety-first.com', 'admin@safety-first.com');
