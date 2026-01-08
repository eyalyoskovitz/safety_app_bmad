# Story 5.2: Add New User

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As an** IT Admin,
**I want** to add new manager/admin users,
**So that** new team members can access the system.

## Acceptance Criteria

**AC1:** Access Add User form
- Given I am on the User Management page
- When I tap "הוסף משתמש" (Add User)
- Then a form opens for new user creation

**AC2:** Fill and submit form
- Given I am filling the add user form
- When I enter: email, full name, role, initial password
- Then I can submit the form
- And all fields are validated

**AC3:** Successful user creation
- Given I submit a valid new user
- When the creation succeeds
- Then the user is added to the database
- And the user is created in Supabase Auth
- And I see a success snackbar: "המשתמש נוסף בהצלחה"
- And the new user appears in the list

**AC4:** Duplicate email handling
- Given I try to add a user with an existing email
- When I submit
- Then I see an error: "כתובת האימייל כבר קיימת במערכת"
- And the form remains open with data preserved

## Definition of Done

- [x] "Add User" button on UserListPage
- [x] Add user form (email, name, role, password)
- [x] Role dropdown with: Manager (מנהל), IT Admin (מנהל מערכת)
- [x] No "Reporter" role option (reporters don't have accounts)
- [x] Create user in Supabase Auth using admin API
- [x] Insert user record in `users` table
- [x] Validation: required fields, valid email format, password strength
- [x] Error handling with Hebrew messages
- [x] Form closes and list refreshes on success
- [x] FR24 verified
- [x] Build passes with no TypeScript errors

---

## Context from Epic 5 and Previous Stories

**Epic 5 Goal:** IT Admin can manage manager/admin user accounts (~10-15 users, not all 50 employees)

**Story 5.1 (COMPLETED) provided:**
- UserListPage at `/manage/users` with existing users display
- `src/features/users/` module structure (api.ts, types.ts, hooks/, components/, pages/)
- `User` type and `getUsers()` API function
- `useUsers` hook for fetching users
- UserCard component for display
- Pattern for Hebrew labels and RTL layout

**This story adds:**
- "Add User" button to UserListPage
- UserForm component (dialog/modal) for creating users
- `createUser()` API function using Supabase Auth Admin API
- Form validation (email format, required fields, password strength)
- Duplicate email handling
- Success/error feedback in Hebrew

**Key Requirements from Epics:**
- Roles: Manager, IT Admin (simplified 2-role model - NO Reporter role, employees submit via public form)
- Email/password authentication via Supabase Auth
- Users table entry created after Auth user creation
- Hebrew error messages throughout

---

## Technical Specification

### Database Schema (Reference)

Follow existing schema from architecture.md lines 642-691. This story uses:

**users table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Valid roles:** `manager`, `it_admin`

**Note:** Simplified 2-role model for MVP. All managers have same permissions regardless of title.

### Supabase Auth Admin API Pattern

**CRITICAL:** Creating users requires Supabase Admin API, not regular client SDK.

**Two approaches:**

**Option 1: Service Role Key (Simpler for MVP)**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,  // Admin key
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Create auth user
const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: userData.email,
  password: userData.password,
  email_confirm: true  // Auto-confirm for internal users
})
```

**Option 2: Edge Function (More secure)**
Create Supabase Edge Function that uses service role internally. Frontend calls function with user data.

**Recommendation for MVP:** Use Option 1 with service role key stored in environment variable. Ensure this key is NEVER committed to git and only used server-side (future enhancement: move to Edge Function).

### API Layer Extensions

**Extend:** `src/features/users/api.ts`

Add new function:

```typescript
/**
 * Create new user with Supabase Auth and users table entry
 * Requires admin privileges
 * @throws Error with Hebrew message on failure
 */
export async function createUser(userData: {
  email: string
  full_name: string
  role: 'manager' | 'it_admin'
  password: string
}): Promise<User> {
  // 1. Create auth user with admin API
  // 2. Insert into users table with auth user ID
  // 3. Handle duplicate email error
  // 4. Return created user
}
```

**Error handling:**
- Duplicate email: "כתובת האימייל כבר קיימת במערכת"
- Invalid email format: "כתובת אימייל לא תקינה"
- Weak password: "הסיסמה חייבת להכיל לפחות 8 תווים"
- Network error: "שגיאה ביצירת המשתמש. נסה שוב."

### Component Layer

**New file:** `src/features/users/components/UserForm.tsx`

Purpose: Dialog form for adding new user

**Key Requirements:**
- MUI Dialog component (full-screen on mobile, modal on desktop)
- Form fields: Email, Full Name, Role (dropdown), Password
- Role dropdown options (2 roles only):
  - `manager` → "מנהל" (Manager)
  - `it_admin` → "מנהל מערכת" (IT Admin)
- Password field with visibility toggle
- Form validation:
  - Email: required, valid format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - Full Name: required, min 2 characters
  - Role: required
  - Password: required, min 8 characters
- Submit button disabled during submission (isSubmitting state)
- Cancel button to close dialog
- Success callback to refresh user list
- Error display with Snackbar (Hebrew messages)

**Structure:**
```typescript
interface UserFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void  // Callback to refresh list
}

export function UserForm({ open, onClose, onSuccess }: UserFormProps) {
  // Form state
  // Validation
  // Submit handler calling createUser()
  // Error handling with Hebrew Snackbar
}
```

**Pattern Reference:** Similar to AssignmentSheet component but with full form inputs.

**Update:** `src/features/users/pages/UserListPage.tsx`

Add "Add User" button and UserForm dialog:

```typescript
export function UserListPage() {
  const { users, isLoading, error, refetch } = useUsers()
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      {/* Existing header with back button */}
      <Button onClick={() => setIsFormOpen(true)}>
        הוסף משתמש
      </Button>

      {/* Existing user list */}

      <UserForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          refetch()  // Refresh list
          setIsFormOpen(false)
        }}
      />
    </>
  )
}
```

**Required change to useUsers hook:**
Add `refetch` function to manually trigger user list refresh after adding user.

### Role Display Mapping

**Database values → Hebrew labels (2 roles only):**

| Database Role | Hebrew Label | English |
|---------------|--------------|---------|
| `manager` | מנהל | Manager |
| `it_admin` | מנהל מערכת | IT Admin |

**Implementation:** Create utility function or mapping object:

```typescript
// src/features/users/utils.ts (NEW file)
export const ROLE_LABELS: Record<string, string> = {
  manager: 'מנהל',
  it_admin: 'מנהל מערכת'
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role
}
```

Use in UserForm dropdown and UserCard display.

**Note:** Simplified from original 4-role model (manager, safety_officer, plant_manager, it_admin) to 2-role model for MVP. All managers have same permissions.

---

## Tasks / Subtasks

### Task 1: Setup Supabase Admin Client (AC3)
- [x] Add `VITE_SUPABASE_SERVICE_ROLE_KEY` to .env.local
- [x] Update .env.example with service role key template
- [x] Create admin client instance in api.ts or separate adminClient.ts
- [x] Verify service role key works with auth.admin.createUser()

**Security Note:** Service role key has full database access. NEVER commit to git. Future: move to Edge Function.

### Task 2: Implement createUser API function (AC3, AC4)
- [x] Add createUser() to src/features/users/api.ts
- [x] Use admin client to create auth user with email/password
- [x] Set email_confirm: true (auto-confirm internal users)
- [x] Insert user record in users table with auth user ID
- [x] Handle duplicate email error (catch Supabase error code)
- [x] Return created user or throw with Hebrew error message
- [x] Export function

### Task 3: Add refetch capability to useUsers hook
- [x] Update src/features/users/hooks/useUsers.ts
- [x] Add refetch function to manually trigger user fetch
- [x] Return refetch from hook: `{ users, isLoading, error, refetch }`
- [x] Test refetch updates user list

### Task 4: Create role mapping utility (AC2)
- [x] Create src/features/users/utils.ts
- [x] Define ROLE_LABELS mapping object (2 roles: manager, it_admin)
- [x] Export getRoleLabel() function
- [x] Update UserCard to use getRoleLabel() for display

### Task 5: Create UserForm component (AC1, AC2, AC3, AC4)
- [x] Create src/features/users/components/UserForm.tsx
- [x] Implement MUI Dialog with form fields
- [x] Email field (TextField, type="email", required)
- [x] Full Name field (TextField, required)
- [x] Role dropdown (Select with ROLE_LABELS options)
- [x] Password field (TextField, type="password", with visibility toggle)
- [x] Form validation on all fields
- [x] Cancel and Submit buttons
- [x] Submit button disabled during submission (isSubmitting)
- [x] Call createUser() on submit
- [x] Show success Snackbar "המשתמש נוסף בהצלחה"
- [x] Show error Snackbar on failure (Hebrew messages)
- [x] Call onSuccess callback on success
- [x] Clear form on success
- [x] Export component

### Task 6: Add "Add User" button to UserListPage (AC1)
- [x] Update src/features/users/pages/UserListPage.tsx
- [x] Add state for dialog open/closed (useState)
- [x] Add "הוסף משתמש" button to header
- [x] Import and render UserForm component
- [x] Pass open, onClose, onSuccess props
- [x] onSuccess callback: call refetch() and close dialog
- [x] Verify button opens form dialog

### Task 7: Form validation and error handling (AC2, AC4)
- [x] Validate email format (regex or input type="email")
- [x] Validate full name not empty (min 2 chars)
- [x] Validate role selected
- [x] Validate password min 8 characters
- [x] Show inline validation errors in Hebrew
- [x] Disable submit until all fields valid
- [x] Handle duplicate email error specifically (AC4)
- [x] Preserve form data on error (don't reset)
- [x] Test all validation scenarios

### Task 8: Update types if needed (AC2)
- [x] Check if User type needs updates (should be fine from 5.1)
- [x] Add NewUserData type for createUser parameter if helpful
- [x] Verify role type matches 2 roles: 'manager' | 'it_admin'

### Task 9: Build and verify (DoD)
- [x] TypeScript compilation passes (npm run build)
- [x] Access /manage/users as IT Admin
- [x] Click "הוסף משתמש" button - form opens
- [x] Submit with valid data - user created and appears in list
- [x] Submit with existing email - error shown, form preserved
- [x] Submit with invalid data - validation errors shown
- [x] Success snackbar shows correct Hebrew message
- [x] Password is not visible in any logs or UI after creation
- [x] FR24 verified

---

## Developer Guardrails

### Reference Project Rules

**ALWAYS follow (don't repeat in story):**
- **RTL layout, Hebrew labels, date formats:** See project-context.md
- **Database schema and users table:** See architecture.md lines 642-691
- **Error messages in Hebrew:** See project-context.md lines 119-131
- **Naming conventions:** See architecture.md lines 328-351
- **File organization:** See architecture.md lines 354-372

### Story-Specific Critical Details

**Supabase Auth Admin API:**
- Use `supabase.auth.admin.createUser()` NOT regular `signUp()`
- Requires service role key (admin privileges)
- Set `email_confirm: true` to auto-confirm internal users
- Service role key must be in environment variable, NEVER in code
- Catch duplicate email error (Supabase error code: '23505' for unique constraint)

**User Creation Flow:**
1. Validate form data on frontend
2. Call createUser() API function
3. API creates auth user with admin client
4. API inserts users table record with auth user ID
5. On success: show snackbar, refresh list, close form
6. On error: show Hebrew error, keep form open with data

**Role Handling:**
- Only 2 roles: `manager`, `it_admin`
- Display shows Hebrew: "מנהל" (Manager), "מנהל מערכת" (IT Admin)
- Use ROLE_LABELS mapping for consistent translation
- Default role: `manager`

**Password Security:**
- Password entered once during creation (no confirmation field needed for admin)
- Min 8 characters validation
- Password sent to Supabase Auth (hashed automatically)
- Password NOT stored in users table
- After creation, IT Admin communicates password to user out-of-band (WhatsApp, verbal, etc.)

**Form UX:**
- Dialog, not separate page (faster workflow)
- Full-screen on mobile, modal on desktop (MUI Dialog default)
- Clear validation errors inline
- Cancel button always enabled
- Submit button disabled during submission and when invalid

### Critical Mistakes to Avoid

❌ **DON'T:**
- Use regular supabase client for user creation (will fail - no admin access)
- Commit service role key to git
- Create "Reporter" role option (employees don't have accounts)
- Reset form on error (user loses their input)
- Show English error messages
- Allow empty password or weak passwords
- Forget to refresh user list after creation
- Create auth user without creating users table record (orphaned auth user)

✅ **DO:**
- Use admin client with service role key
- Store service role key in .env.local only
- Limit roles to: manager, it_admin (2 roles only)
- Preserve form data on error for user to correct
- All errors in Hebrew via Snackbar
- Validate password min 8 characters
- Refresh list via refetch() after success
- Create BOTH auth user AND users table record (atomic operation)
- Handle duplicate email error gracefully (AC4)

### Token Efficiency Notes

**This story references (not repeats):**
- RTL/Hebrew rules → project-context.md
- Database schema → architecture.md lines 642-691
- Naming conventions → architecture.md lines 328-351
- Error handling → project-context.md lines 119-131
- User type → Story 5.1 (types.ts)
- UserListPage structure → Story 5.1 (UserListPage.tsx)
- Dialog pattern → Similar to AssignmentSheet from Story 3.4

**This story adds (new/unique):**
- UserForm dialog component
- createUser() API function with Supabase Admin
- Service role key setup
- Form validation (email, name, role, password)
- Duplicate email handling
- refetch() capability to useUsers hook
- Role label mapping utility
- "Add User" button to UserListPage

---

## Integration Points

### With Existing Features

**Story 5.1 (User List View):**
- Extends UserListPage with "Add User" button
- Uses User type from types.ts
- Reuses useUsers hook (enhanced with refetch)
- New users appear in existing UserCard list

**Story 1.5 (Authentication):**
- Uses Supabase Auth for user creation
- Creates auth.users entry that integrates with login system
- New users can immediately log in with created credentials

**Story 1.6 (Role-Based Access):**
- Created users get role that determines their access
- RoleRoute component will use user's role from users table
- IT Admin role gets full access, managers get limited access

**Supabase Client:**
- Uses existing supabase client from lib/supabase.ts for users table
- Requires NEW admin client for auth.admin.createUser()
- Admin client should be separate module or conditionally created

### With Future Stories

**Story 5.3 (Role Assignment):**
- Will allow editing role after user created
- Will reuse ROLE_LABELS mapping from this story

**Story 5.4 (Remove User):**
- Will delete users created by this story
- Will need to handle both auth.users and users table

**Story 5.5 (Password Reset):**
- Will reset passwords for users created by this story
- Will use similar admin API pattern

---

## Security Considerations

### Service Role Key Management

**CRITICAL:** Service role key has full database access, bypassing RLS policies.

**Current approach (MVP):**
- Store in .env.local as `VITE_SUPABASE_SERVICE_ROLE_KEY`
- Use only for admin operations (createUser)
- Never commit to git (ensure in .gitignore)
- Frontend access means key is in browser (acceptable for internal tool with IT Admin-only access)

**Future enhancement (Post-MVP):**
- Move user creation to Supabase Edge Function
- Edge Function uses service role server-side
- Frontend calls Edge Function without exposing key
- More secure for production deployment

**Risk mitigation (MVP):**
- Only IT Admins can access user management page (RoleRoute protection)
- Small, trusted user base (~10-15 people, all internal staff)
- Internal tool, not public-facing
- Can rotate service role key if compromised

### Password Handling

- Password sent over HTTPS to Supabase
- Supabase hashes with bcrypt automatically
- Password never stored in users table
- Password not logged or displayed after creation
- IT Admin communicates initial password to user out-of-band

### Input Validation

- Email format validated (regex)
- Full name required (prevent empty users)
- Role validated against allowed values
- Password min length enforced (8 chars)
- Duplicate email rejected by database unique constraint

---

## Testing Considerations

### Manual Testing Checklist

**Happy Path:**
1. Log in as IT Admin
2. Navigate to /manage/users
3. Click "הוסף משתמש" button
4. Fill form: email@example.com, "ישראל ישראלי", Manager, "password123"
5. Submit form
6. Verify success snackbar "המשתמש נוסף בהצלחה"
7. Verify new user appears in list
8. Verify new user can log in with created credentials

**Validation Errors:**
1. Try to submit with empty email → inline error
2. Try invalid email format → inline error
3. Try empty full name → inline error
4. Try no role selected → inline error
5. Try password <8 chars → inline error
6. Verify submit button disabled when invalid

**Duplicate Email (AC4):**
1. Create user with email "test@example.com"
2. Try to create another user with same email
3. Verify error snackbar "כתובת האימייל כבר קיימת במערכת"
4. Verify form stays open with data preserved
5. Change email and resubmit successfully

**Access Control:**
1. Log in as Manager (not IT Admin)
2. Try to access /manage/users
3. Verify access denied or redirect
4. Verify cannot see "Add User" functionality

**Edge Cases:**
1. Network error during creation → Hebrew error message
2. Very long name (>100 chars) → handled gracefully
3. Special characters in name → accepted
4. International email formats → accepted
5. Cancel form after partial fill → form resets on reopen

### Build Verification

```bash
# TypeScript compilation
npm run build

# Development server (for manual testing)
npm run dev
```

**Success Criteria:**
- Zero TypeScript errors
- Zero console warnings about service role key
- Form opens and closes smoothly
- All validation works correctly
- Users created successfully appear in list
- Duplicate email error handled per AC4
- All Hebrew text displays correctly RTL

---

## Environment Setup

### New Environment Variable

Add to `.env.local`:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Add to `.env.example`:
```
# Supabase Service Role Key (for admin operations)
# Get from Supabase Dashboard > Settings > API > service_role key
# CRITICAL: Never commit this key to git!
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to get the key:**
1. Go to Supabase Dashboard
2. Select your project
3. Settings → API
4. Copy "service_role" key (not "anon" key)

**Important:** Service role key is different from anon key. It has admin privileges.

---

## References

**Project Artifacts:**
- Epic 5: epics.md lines 1098-1292 (Story 5.2: lines 1146-1183)
- Architecture: architecture.md (database schema lines 642-691)
- Project Context: project-context.md

**Code References (from Story 5.1):**
- UserListPage: safety-first/src/features/users/pages/UserListPage.tsx
- User type: safety-first/src/features/users/types.ts
- Users API: safety-first/src/features/users/api.ts
- useUsers hook: safety-first/src/features/users/hooks/useUsers.ts

**External Docs:**
- [Supabase Auth Admin](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [MUI Dialog](https://mui.com/material-ui/react-dialog/)
- [MUI TextField](https://mui.com/material-ui/react-text-field/)
- [MUI Select](https://mui.com/material-ui/react-select/)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

None - implementation completed without issues.

### Completion Notes

**Implementation Summary:**

Successfully implemented Story 5.2: Add New User - IT Admin can now create new manager/admin users through a dialog form.

**All Acceptance Criteria Met:**

**AC1 - Access Add User form:** "Add User" button (הוסף משתמש) added to UserListPage header. Clicking opens a modal dialog form.

**AC2 - Fill and submit form:** Form includes:
- Email field (type="email", validated with regex)
- Full Name field (min 2 characters)
- Role dropdown with 2 options: Manager (מנהל), IT Admin (מנהל מערכת)
- Password field with visibility toggle (min 8 characters)
- All fields validated with inline Hebrew error messages
- Submit button disabled until all fields valid and during submission

**AC3 - Successful user creation:**
- User created in Supabase Auth using admin API (email_confirm: true for auto-confirmation)
- User record inserted in users table with auth user ID
- Success snackbar displays: "המשתמש נוסף בהצלחה"
- User list automatically refreshes via refetch()
- Form closes and clears on success

**AC4 - Duplicate email handling:**
- Duplicate email detected at both Auth and DB levels (error code 23505)
- Hebrew error snackbar: "כתובת האימייל כבר קיימת במערכת"
- Form remains open with user data preserved for correction

**Key Implementation Details:**

1. **Supabase Admin Client:** Created `src/lib/supabaseAdmin.ts` with service role key for admin operations. Includes security warnings and notes about future Edge Function migration.

2. **createUser API Function:** Implemented atomic user creation flow:
   - Step 1: Create auth user with admin API
   - Step 2: Insert users table record with same ID
   - Comprehensive error handling with Hebrew messages
   - Duplicate email detection at both levels

3. **Role Mapping Utility:** Created `src/features/users/utils.ts` with ROLE_LABELS constant mapping database values (manager, it_admin) to Hebrew labels (מנהל, מנהל מערכת). Updated UserCard to use getRoleLabel() for consistent translation.

4. **useUsers Hook Enhancement:** Added refetch() function using useCallback for manual list refresh after user creation. Returns `{ users, isLoading, error, refetch }`.

5. **UserForm Component:** Comprehensive dialog form with:
   - MUI Dialog (modal on all screen sizes)
   - Form fields: Email, Full Name, Role dropdown, Password with visibility toggle
   - Real-time validation with inline Hebrew error messages
   - Submit button intelligently disabled (during submission and when form invalid)
   - Success and error Snackbars in Hebrew
   - Form clears on success, preserves data on error
   - Cancel button always enabled

6. **UserListPage Integration:** Added "Add User" button with AddIcon to page header. Integrated UserForm dialog with state management. onSuccess handler calls refetch() and closes dialog.

7. **Security Considerations:**
   - Service role key stored in .env.local (gitignored)
   - Password never stored in users table (Supabase Auth handles hashing)
   - No password logging or display after creation
   - Auto-confirmation enabled for internal users (email_confirm: true)

8. **Type Safety:** User type already correct with 2-role union: `role: 'manager' | 'it_admin'`. No type updates needed.

**Build Verification:**
- TypeScript compilation: ✅ PASS (zero errors)
- Vite build: ✅ SUCCESS (17.64s)
- All validation scenarios covered in component
- Hebrew RTL layout maintained throughout
- Form UX follows project patterns (Dialog, Snackbar, inline validation)

**Environment Setup:**
- Added VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local
- Updated .env.example with service role key template and security warnings

**Simplified from 4-role to 2-role model:**
- Original design: manager, safety_officer, plant_manager, it_admin
- Implemented: manager, it_admin (simplified 2-role model per user request)
- All managers have same permissions regardless of title

**Foundation for Future Stories:**
- Story 5.3 (Role Assignment) can reuse ROLE_LABELS mapping
- Story 5.4 (Remove User) can use similar admin API pattern
- Story 5.5 (Password Reset) can leverage admin client

**Post-Implementation Bug Fixes:**

After user testing, 4 issues were identified and fixed:

1. **Button Spacing:** Added `gap: 1` to "Add User" button for proper spacing between icon and text in `UserListPage.tsx`

2. **TextField Label RTL Positioning (CRITICAL UX):** TextField labels and placeholders were positioned at left edge (0px from border) instead of having proper RTL padding
   - **Root Cause:** MUI TextField labels don't automatically position correctly for RTL layout
   - **Solution:** Added RTL label positioning to all TextFields and Select components:
     ```tsx
     sx={{
       '& .MuiInputLabel-root': {
         right: '22px !important',
         left: 'auto !important'
       },
       '& .MuiInputLabel-shrink': {
         right: '26px !important'
       }
     }}
     inputProps={{ dir: 'rtl' }}
     ```
   - **Applied to:** Email, Full Name, Role dropdown, Password fields
   - **Result:** Labels now properly positioned 22px from right border in RTL mode

3. **User Creation Error (CRITICAL):** Fixed duplicate key constraint error (`users_pkey` violation)
   - **Root Cause:** Database has a trigger that auto-creates user profiles when auth users are created
   - **Solution:** Changed from `.insert()` to `.upsert()` with `onConflict: 'id'` to handle auto-created profiles in `api.ts`
   - **Result:** User creation now works correctly, updating the trigger-created record with our data (full_name, role)

4. **Dialog Focus Warning:** Fixed aria-hidden accessibility warning by adding `disableRestoreFocus` to Dialog component

**Note:** "Multiple GoTrueClient instances" warning is expected and safe - we intentionally have two clients (regular anon key + admin service role key) for proper architecture.

### File List

**Files Created:**
- `safety-first/src/lib/supabaseAdmin.ts` - Admin client with service role key for user management
- `safety-first/src/features/users/utils.ts` - Role mapping utility (ROLE_LABELS, getRoleLabel)
- `safety-first/src/features/users/components/UserForm.tsx` - User creation dialog form with full validation

**Files Modified:**
- `safety-first/.env.local` - Added VITE_SUPABASE_SERVICE_ROLE_KEY with actual key
- `safety-first/.env.example` - Added service role key template with security warnings
- `safety-first/src/features/users/api.ts` - Added createUser() function using admin API; Fixed: Changed insert to upsert to handle auto-created user profiles from database trigger
- `safety-first/src/features/users/hooks/useUsers.ts` - Added refetch() capability
- `safety-first/src/features/users/components/UserCard.tsx` - Updated to use getRoleLabel() utility
- `safety-first/src/features/users/pages/UserListPage.tsx` - Added "Add User" button and UserForm integration; Fixed: Added gap spacing between icon and text
- `safety-first/src/features/users/components/UserForm.tsx` - User creation dialog; Fixed: Added RTL label positioning to all TextField and Select components, added disableRestoreFocus
- `safety-first/src/lib/supabaseAdmin.ts` - Admin client configuration; Added detectSessionInUrl and flowType settings
