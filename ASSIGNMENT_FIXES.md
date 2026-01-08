# Assignment Feature Fixes - 2026-01-05

## Issues Fixed

### ✅ Issue 1: Filter managers by role + Search functionality
**Problem:** Assignment sheet showed all users, not just managers. No search capability.

**Solution:**
- Updated `getUsers()` API to accept optional `role` parameter
- Updated `useUsers()` hook to filter by role='manager'
- Added search TextField with real-time filtering by name or email
- Shows helpful message if no managers found

**Files Changed:**
- `safety-first/src/features/users/api.ts`
- `safety-first/src/features/users/hooks/useUsers.ts`
- `safety-first/src/features/incidents/components/AssignmentSheet.tsx`

---

### ✅ Issue 2: RLS Permission Error
**Problem:** Getting error "שגיאה בשיוך האירוע" when trying to assign.

**Root Cause:** Row Level Security policy only allowed:
- Managers to update incidents already assigned to them
- Safety officers/admins to update any incident

But when assigning a NEW incident (status='new', assigned_to=NULL), the first condition failed.

**Solution:** Created new RLS migration that splits the policy:
1. Safety officers can update ANY incident (for assignment)
2. Managers can update incidents assigned to them (for resolution)

**Migration File Created:**
`safety-first/supabase/migrations/20260105_fix_assignment_rls.sql`

**⚠️ ACTION REQUIRED:** Apply this migration to your Supabase database!

```bash
# Navigate to safety-first folder
cd safety-first

# Push migration to Supabase
npx supabase db push
```

---

### ✅ Issue 3: Button placement and size
**Problem:** Assign button was large, full-width, and in a separate section below the card.

**Solution:**
- Moved button to the status/severity line (top of the incident details)
- Changed to small outlined button with icon
- Uses `marginInlineStart: 'auto'` to align to the end (RTL-compatible)
- Smaller font size (0.8rem) and compact padding

**Files Changed:**
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx`

---

## Next Steps

### 1. Apply the Database Migration ⚠️ CRITICAL

**IMPORTANT:** The app now uses only 2 roles: `manager` and `it_admin`

Apply the migration via Supabase Dashboard → SQL Editor:
- Migration file: `20260105_update_roles_to_manager_admin.sql`

This will:
- Update all RLS policies to use only 'manager' and 'it_admin' roles
- Allow managers to assign incidents to other managers
- Allow IT admins full access to everything

### 2. Add Manager Users to the Database

You need users with `role='manager'` in your database. You can add them via:

**Option A: Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Create new users
3. After creating, go to Database → users table
4. Set the `role` column to `'manager'` for those users

**Option B: SQL Insert**
```sql
-- Insert manager users (example)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES
  ('manager1@example.com', crypt('password123', gen_salt('bf')), now(), 'authenticated');

-- Then update the users table with role
UPDATE users
SET role = 'manager'
WHERE email = 'manager1@example.com';
```

**Option C: Via User Management UI**
Use Epic 5 (User Management) features to add users with role='manager' through the app.

### 3. Test the Assignment Flow

1. Login as a safety officer
2. Navigate to an incident detail page
3. Click the small "שיוך" button (top line with status/severity)
4. Search for a manager by name or email
5. Click on a manager card to assign
6. Verify success message and status updates to "Assigned"

---

## Files Modified Summary

**New Files:**
- `safety-first/supabase/migrations/20260105_fix_assignment_rls.sql`

**Modified Files:**
- `safety-first/src/features/users/api.ts` - Added role filtering
- `safety-first/src/features/users/hooks/useUsers.ts` - Added role parameter
- `safety-first/src/features/incidents/components/AssignmentSheet.tsx` - Added search, role filter, better messages
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Moved button to status line, made smaller

---

## Technical Details

### Search Functionality
- Real-time filtering using `useMemo`
- Searches both `full_name` and `email` fields
- Case-insensitive search
- Shows "no results" message when search yields nothing

### UI Improvements
- Compact button design (size="small", outlined variant)
- RTL-compatible positioning with `marginInlineStart: 'auto'`
- Icon + text for better UX
- Integrated into existing status/severity line

### RLS Policy Changes
Before:
```sql
CREATE POLICY "Managers can update assigned incidents"
  USING (assigned_to = auth.uid() OR role IN ('safety_officer', 'it_admin'));
```

After (split into two policies):
```sql
-- Safety officers can manage ALL incidents
CREATE POLICY "Safety officers can manage all incidents"
  USING (role IN ('safety_officer', 'it_admin'));

-- Managers can update their own incidents
CREATE POLICY "Managers can update their assigned incidents"
  USING (assigned_to = auth.uid());
```

---

## Build Status

✅ TypeScript compilation: Passed
✅ Production build: Successful
✅ All imports: Valid

---

**Ready to test after applying the migration!** 🚀
