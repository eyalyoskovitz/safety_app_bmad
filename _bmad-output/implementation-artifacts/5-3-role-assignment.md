# Story 5.3: Role Assignment

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As an** IT Admin,
**I want** to change a user's role,
**So that** I can adjust permissions when responsibilities change.

## Acceptance Criteria

**AC1:** Access user edit view
- Given I am on the user list
- When I tap on a user
- Then I see a user detail/edit view

**AC2:** Change role and save
- Given I am editing a user
- When I change their role from the dropdown
- And I save the changes
- Then the role is updated in the database
- And I see a success snackbar: "התפקיד עודכן בהצלחה"
- And the user list reflects the new role

**AC3:** Prevent self-demotion
- Given I am editing my own account
- When I try to remove my IT Admin role
- Then I see a warning: "לא ניתן להסיר הרשאת מנהל מעצמך"
- And the change is prevented
- And my role remains IT Admin

## Definition of Done

- [x] User detail/edit dialog or page accessible from user list
- [x] Role dropdown for editing with 2 roles (Manager, IT Admin)
- [x] Update user role in database via API
- [x] Prevent self-demotion from IT Admin (AC3)
- [x] Success snackbar in Hebrew: "התפקיד עודכן בהצלחה"
- [x] Error snackbar on failure (Hebrew messages)
- [x] User list refreshes after successful update
- [x] FR25 verified
- [x] Build passes with no TypeScript errors

---

## Context from Epic 5 and Previous Stories

**Epic 5 Goal:** IT Admin can manage manager/admin user accounts (~10-15 users, not all 50 employees)

**Story 5.1 (COMPLETED) provided:**
- UserListPage structure at `/manage/users`
- UserCard component for displaying users
- User type and getUsers() API
- useUsers hook with refetch() capability

**Story 5.2 (IN REVIEW) provided:**
- UserForm dialog pattern (can be adapted for editing vs. creating)
- ROLE_LABELS mapping in utils.ts: `{ manager: 'מנהל', it_admin: 'מנהל מערכת' }`
- getRoleLabel() utility function
- Admin client pattern (supabaseAdmin.ts) for privileged operations
- RTL TextField label positioning fix (critical for Hebrew forms)
- refetch() pattern for refreshing user list after changes
- Success/error Snackbar pattern in Hebrew

**This story adds:**
- Edit user dialog (similar to UserForm but for updating, not creating)
- updateUserRole() API function
- Self-demotion prevention logic
- Click handler on UserCard to open edit dialog
- Role change validation

**Key Requirements from Epics:**
- Only 2 roles: Manager, IT Admin (simplified 2-role model)
- IT Admin cannot demote themselves (security safeguard)
- Changes reflect immediately in user list
- All messaging in Hebrew

---

## Technical Specification

### Database Schema (Reference)

Follow existing schema from architecture.md lines 642-691. This story updates:

**users table:**
```sql
-- Columns of interest for this story:
id UUID PRIMARY KEY           -- User to update
role TEXT NOT NULL            -- Field we're changing
updated_at TIMESTAMPTZ        -- Auto-updated by trigger
```

**Valid roles:** `manager`, `it_admin` (2-role model)

### API Layer Extensions

**Extend:** `src/features/users/api.ts`

Add new function:

```typescript
/**
 * Update user's role
 * Requires IT Admin privileges
 * @param userId - UUID of user to update
 * @param newRole - New role (manager or it_admin)
 * @throws Error with Hebrew message on failure
 */
export async function updateUserRole(
  userId: string,
  newRole: 'manager' | 'it_admin'
): Promise<User> {
  // 1. Update users table with new role
  // 2. Check for error (especially self-demotion case)
  // 3. Return updated user
}
```

**Error handling:**
- Self-demotion: "לא ניתן להסיר הרשאת מנהל מעצמך"
- Network error: "שגיאת רשת. נסה שוב."
- Not found: "המשתמש לא נמצא"
- Unauthorized: "אין הרשאה לפעולה זו"

**Self-demotion prevention:**
- Check if userId === current user's ID AND newRole !== 'it_admin'
- Prevent at BOTH frontend (before API call) and backend (in API function) for defense in depth
- Use AuthContext to get current user ID

### Component Layer

**New file:** `src/features/users/components/UserEditDialog.tsx`

Purpose: Dialog for editing user role

**Key Requirements:**
- Similar structure to UserForm from Story 5.2, but simpler (only role field)
- MUI Dialog component
- Display user's email and full name (read-only)
- Role dropdown (editable) with ROLE_LABELS options
- Submit button: "שמור שינויים" (Save Changes)
- Cancel button
- Self-demotion check before allowing submit
- Success/error Snackbars in Hebrew
- Close dialog after successful update

**Structure:**
```typescript
interface UserEditDialogProps {
  user: User | null  // null when closed
  open: boolean
  onClose: () => void
  onSuccess: () => void  // Callback to refresh list
  currentUserId: string  // For self-demotion check
}

export function UserEditDialog({
  user,
  open,
  onClose,
  onSuccess,
  currentUserId
}: UserEditDialogProps) {
  // Form state (role only)
  // Self-demotion validation
  // Submit handler calling updateUserRole()
  // Error handling with Hebrew Snackbar
}
```

**Pattern Reference:** Simplified version of UserForm from Story 5.2. Only role field, no password/email/name inputs.

**Update:** `src/features/users/components/UserCard.tsx`

Make UserCard clickable to open edit dialog:

```typescript
// Add onClick prop
interface UserCardProps {
  user: User
  onClick?: (user: User) => void  // NEW
}

// Add onClick to Card component
<Card onClick={() => onClick?.(user)} sx={{ cursor: 'pointer' }}>
  {/* Existing content */}
</Card>
```

**Update:** `src/features/users/pages/UserListPage.tsx`

Add edit dialog state and handler:

```typescript
export function UserListPage() {
  const { users, isLoading, error, refetch } = useUsers()
  const { user: currentUser } = useAuth()  // For self-demotion check
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <>
      {/* Existing header and Add User button */}

      {/* User list with click handler */}
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onClick={setSelectedUser}  // Open edit dialog
        />
      ))}

      {/* Add User dialog from Story 5.2 */}

      {/* NEW: Edit User dialog */}
      <UserEditDialog
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSuccess={() => {
          refetch()
          setSelectedUser(null)
        }}
        currentUserId={currentUser?.id || ''}
      />
    </>
  )
}
```

### Role Mapping (Already Exists from Story 5.2)

**Reuse:** `src/features/users/utils.ts`

```typescript
export const ROLE_LABELS: Record<string, string> = {
  manager: 'מנהל',
  it_admin: 'מנהל מערכת'
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role
}
```

No changes needed - already implemented in Story 5.2.

---

## Tasks / Subtasks

### Task 1: Implement updateUserRole API function (AC2, AC3)
- [x] Add updateUserRole() to src/features/users/api.ts
- [x] Accept userId and newRole as parameters
- [x] Get current user ID from auth session
- [x] Check if userId === currentUserId AND newRole !== 'it_admin' (self-demotion)
- [x] If self-demotion, throw error: "לא ניתן להסיר הרשאת מנהל מעצמך"
- [x] Update users table: `UPDATE users SET role = newRole WHERE id = userId`
- [x] Handle errors with Hebrew messages
- [x] Return updated user
- [x] Export function

### Task 2: Create UserEditDialog component (AC1, AC2, AC3)
- [x] Create src/features/users/components/UserEditDialog.tsx
- [x] Implement MUI Dialog with user info
- [x] Display email (read-only Typography)
- [x] Display full name (read-only Typography)
- [x] Role dropdown (Select with ROLE_LABELS options)
- [x] Apply RTL label positioning from Story 5.2 pattern
- [x] Pre-fill role with user.role value
- [x] Frontend self-demotion check before submit
- [x] Submit button: "שמור שינויים"
- [x] Cancel button to close dialog
- [x] Call updateUserRole() on submit
- [x] Show success Snackbar: "התפקיד עודכן בהצלחה"
- [x] Show error Snackbar on failure (Hebrew)
- [x] Call onSuccess callback on success
- [x] Export component

### Task 3: Make UserCard clickable (AC1)
- [x] Update src/features/users/components/UserCard.tsx
- [x] Add onClick prop to UserCardProps interface
- [x] Add onClick handler to Card component
- [x] Add cursor: pointer style when onClick provided
- [x] Verify card is clickable and triggers callback

### Task 4: Integrate edit dialog in UserListPage (AC1, AC2)
- [x] Update src/features/users/pages/UserListPage.tsx
- [x] Import useAuth to get current user
- [x] Add state for selectedUser (useState<User | null>)
- [x] Pass onClick to UserCard components
- [x] onClick sets selectedUser state
- [x] Import and render UserEditDialog
- [x] Pass selectedUser, open, onClose, onSuccess, currentUserId
- [x] onSuccess calls refetch() and clears selectedUser
- [x] Verify clicking user opens edit dialog

### Task 5: Self-demotion prevention (AC3)
- [x] Frontend check in UserEditDialog before submit
- [x] If currentUserId === user.id AND newRole === 'manager', show warning
- [x] Display warning snackbar: "לא ניתן להסיר הרשאת מנהל מעצמך"
- [x] Prevent form submission
- [x] Backend check in updateUserRole() as fallback
- [x] Test: IT Admin edits own role, tries to change to Manager
- [x] Verify error message displays and role doesn't change

### Task 6: Build and verify (DoD)
- [x] TypeScript compilation passes (npm run build)
- [x] Access /manage/users as IT Admin
- [x] Click on a user - edit dialog opens
- [x] Change role and save - role updates in list
- [x] Success snackbar shows correct Hebrew message
- [x] Try to demote self - warning shows, change prevented
- [x] Error snackbar shows on network failure
- [x] FR25 verified

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

**Self-Demotion Prevention:**
- Check at frontend: Before calling API, validate currentUserId !== userId OR newRole === 'it_admin'
- Check at backend: In updateUserRole(), get session user, validate they're not demoting themselves
- Defense in depth: Both checks prevent security bypass
- Error message: "לא ניתן להסיר הרשאת מנהל מעצמך"

**Role Update Flow:**
1. User clicks UserCard → opens UserEditDialog
2. User selects new role from dropdown
3. Frontend validates not self-demotion
4. Call updateUserRole() API function
5. API validates not self-demotion (backend check)
6. Update users table role field
7. On success: show snackbar, refresh list, close dialog
8. On error: show Hebrew error, keep dialog open

**Role Handling:**
- Only 2 roles: `manager`, `it_admin`
- Display shows Hebrew via ROLE_LABELS (already exists from 5.2)
- Dropdown uses getRoleLabel() for consistent translation
- No role creation - hardcoded options only

**Edit Dialog UX:**
- Simpler than UserForm (only role field is editable)
- Email and name displayed as read-only (Typography or disabled TextField)
- Only role dropdown is interactive
- No password field (that's Story 5.5)
- Dialog not form - no complex validation needed
- Focus on role change only

**UserCard Interaction:**
- Make entire card clickable (not just a button)
- Add cursor: pointer style
- Provide visual feedback on hover (optional: elevation change)
- Pass user object to onClick handler

### Critical Mistakes to Avoid

❌ **DON'T:**
- Allow IT Admin to demote themselves (security risk)
- Skip backend validation of self-demotion (frontend can be bypassed)
- Update multiple fields at once (this story is role only)
- Create new role options beyond manager/it_admin
- Forget to refresh user list after update
- Show English error messages
- Make role dropdown without using existing ROLE_LABELS

✅ **DO:**
- Check self-demotion at both frontend and backend
- Get current user ID from AuthContext
- Only update role field in database
- Use ROLE_LABELS from utils.ts for dropdown
- Refresh list via refetch() after success
- All errors in Hebrew via Snackbar
- Reuse RTL TextField label positioning from Story 5.2
- Keep dialog simple - role change only

### Token Efficiency Notes

**This story references (not repeats):**
- RTL/Hebrew rules → project-context.md
- Database schema → architecture.md lines 642-691
- Naming conventions → architecture.md lines 328-351
- Error handling → project-context.md lines 119-131
- User type → Story 5.1 (types.ts)
- UserListPage structure → Story 5.1 (UserListPage.tsx)
- ROLE_LABELS mapping → Story 5.2 (utils.ts)
- Dialog pattern → Story 5.2 (UserForm.tsx)
- RTL TextField positioning → Story 5.2 (UserForm.tsx lines with sx: right 22px)
- refetch() pattern → Story 5.2 (useUsers hook)

**This story adds (new/unique):**
- UserEditDialog component (simpler than UserForm - role only)
- updateUserRole() API function
- Self-demotion prevention logic (frontend + backend)
- Clickable UserCard with onClick handler
- Edit workflow integration in UserListPage

---

## Integration Points

### With Existing Features

**Story 5.1 (User List View):**
- Extends UserCard with onClick capability
- Uses User type from types.ts
- Reuses useUsers hook with refetch()
- Edit dialog opens from UserListPage

**Story 5.2 (Add New User):**
- Reuses ROLE_LABELS and getRoleLabel() from utils.ts
- Similar dialog pattern to UserForm (but simpler)
- Reuses RTL TextField label positioning technique
- Uses same Snackbar success/error pattern
- Both dialogs coexist in UserListPage

**Story 1.5 (Authentication):**
- Uses AuthContext to get current user ID
- Current user ID needed for self-demotion check
- Role changes affect user's permissions immediately

**Story 1.6 (Role-Based Access):**
- Updated roles affect RoleRoute behavior
- If user's role changes while logged in, may need re-login to reflect permissions (acceptable for MVP)
- IT Admin cannot accidentally lock themselves out (self-demotion prevented)

### With Future Stories

**Story 5.4 (Remove User):**
- Similar self-deletion prevention (cannot remove yourself)
- May reuse edit dialog pattern or create separate remove confirmation

**Story 5.5 (Password Reset):**
- Will add password reset to user management
- Could extend UserEditDialog or create separate dialog
- May add "Reset Password" button to edit dialog in future

---

## Security Considerations

### Self-Demotion Prevention

**Why it matters:**
- If last IT Admin demotes themselves to Manager, no one can manage users
- System becomes locked - cannot add users, change roles, or reset passwords
- Requires database-level manual intervention to fix

**Implementation:**
- **Frontend check:** Validate before API call, show immediate feedback
- **Backend check:** Validate in API function, prevent security bypass
- **Defense in depth:** Both checks ensure safety

**Edge cases:**
- Multiple IT Admins: Still prevent self-demotion (each admin might demote themselves)
- Role change while editing: Get fresh current user ID from AuthContext
- API bypass: Backend check catches any attempt to bypass frontend

### Permission Changes

**Current implementation:**
- Role change is immediate in database
- User's active session may not reflect new role until re-login (acceptable for MVP)
- RoleRoute checks role from database on each protected route access

**Future enhancement (Post-MVP):**
- Detect role change and force re-authentication
- Real-time permission updates via Supabase realtime subscriptions
- Notify user of permission changes

### Audit Trail

**Current implementation:**
- updated_at timestamp automatically updated by database trigger
- No "updated_by" field (simple approach for MVP)

**Future enhancement (Post-MVP):**
- Add audit_log table with: who changed what, when, and from/to values
- Track all role changes for compliance
- Display audit history in user detail view

---

## Testing Considerations

### Manual Testing Checklist

**Happy Path:**
1. Log in as IT Admin
2. Navigate to /manage/users
3. Click on a user with "Manager" role
4. Edit dialog opens showing user info
5. Change role to "IT Admin"
6. Click "שמור שינויים"
7. Verify success snackbar: "התפקיד עודכן בהצלחה"
8. Verify user's role chip now shows "מנהל מערכת"
9. Click on same user again
10. Verify role dropdown shows "IT Admin" selected

**Self-Demotion Prevention (AC3):**
1. Log in as IT Admin (note your user ID)
2. Click on your own user card
3. Try to change role from "IT Admin" to "Manager"
4. Attempt to submit
5. Verify warning snackbar: "לא ניתן להסיר הרשאת מנהל מעצמך"
6. Verify role remains "IT Admin"
7. Verify dialog stays open (doesn't close on error)

**Role Change Validation:**
1. Edit a Manager user, change to IT Admin → Success
2. Edit an IT Admin user, change to Manager → Success (unless self-demotion)
3. Verify dropdown only shows 2 options (Manager, IT Admin)
4. Verify Hebrew labels in dropdown

**Error Handling:**
1. Disconnect network
2. Try to change a role
3. Verify Hebrew error snackbar
4. Verify dialog stays open
5. Reconnect and retry → Success

**User List Refresh:**
1. Open user list
2. Edit a user's role
3. Save changes
4. Verify list updates WITHOUT manual page refresh
5. Verify role chip shows new role immediately

**Access Control:**
1. Log in as Manager (not IT Admin)
2. Try to access /manage/users
3. Verify access denied (from Story 5.1)
4. IT Admin role cannot edit roles

**UI/UX:**
1. Click user card → dialog opens smoothly
2. Role dropdown opens and displays Hebrew labels
3. Click cancel → dialog closes, no changes saved
4. Dialog responsive on mobile and desktop
5. Hover over user card → cursor changes to pointer

### Build Verification

```bash
# TypeScript compilation
npm run build

# Development server (for manual testing)
npm run dev
```

**Success Criteria:**
- Zero TypeScript errors
- Dialog opens/closes smoothly
- Role updates reflect in list immediately
- Self-demotion prevention works (AC3)
- All Hebrew text displays correctly RTL
- Dropdown shows exactly 2 role options
- Success/error snackbars in Hebrew

---

## References

**Project Artifacts:**
- Epic 5: epics.md lines 1098-1292 (Story 5.3: lines 1186-1216)
- Architecture: architecture.md (database schema lines 642-691)
- Project Context: project-context.md

**Code References (from Story 5.1 & 5.2):**
- UserListPage: safety-first/src/features/users/pages/UserListPage.tsx
- UserCard: safety-first/src/features/users/components/UserCard.tsx
- User type: safety-first/src/features/users/types.ts
- Users API: safety-first/src/features/users/api.ts
- useUsers hook: safety-first/src/features/users/hooks/useUsers.ts
- ROLE_LABELS: safety-first/src/features/users/utils.ts
- UserForm (pattern ref): safety-first/src/features/users/components/UserForm.tsx

**External Docs:**
- [MUI Dialog](https://mui.com/material-ui/react-dialog/)
- [MUI Select](https://mui.com/material-ui/react-select/)
- [Supabase Update](https://supabase.com/docs/reference/javascript/update)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

None - implementation completed without issues.

### Completion Notes

**Implementation Summary:**

Successfully implemented Story 5.3: Role Assignment - IT Admin can now change user roles with critical self-demotion prevention.

**All Acceptance Criteria Met:**

**AC1 - Access user edit view:** User cards are now clickable. Clicking on any user card opens the UserEditDialog showing user information with editable role field.

**AC2 - Change role and save:**
- Edit dialog displays email and full name (read-only)
- Role dropdown with 2 options: Manager (מנהל), IT Admin (מנהל מערכת)
- Role updates are saved to database via updateUserRole() API
- Success snackbar displays: "התפקיד עודכן בהצלחה"
- User list automatically refreshes via refetch()
- Dialog closes after successful update

**AC3 - Prevent self-demotion:**
- Frontend validation: isSelfDemotion() check before API call
- Backend validation: updateUserRole() checks session user
- Hebrew error snackbar: "לא ניתן להסיר הרשאת מנהל מעצמך"
- Change is prevented at both levels (defense in depth)
- Dialog remains open for user to correct

**Key Implementation Details:**

1. **updateUserRole API Function** (`api.ts`):
   - Gets current user from auth session for self-demotion check
   - Backend validation prevents security bypass
   - Updates only role field in users table
   - Comprehensive error handling with Hebrew messages
   - Returns updated user object

2. **UserEditDialog Component** (new file):
   - Simplified dialog focusing on role change only
   - Read-only display of email and full name using Typography
   - Editable role dropdown with ROLE_LABELS
   - RTL label positioning (same pattern as Story 5.2)
   - Frontend self-demotion validation with isSelfDemotion()
   - Submit button disabled when no changes made
   - Success/error Snackbars in Hebrew
   - Brief delay before closing to show success message

3. **UserCard Enhancements**:
   - Added optional onClick prop to interface
   - Card becomes clickable when onClick provided
   - cursor: pointer style applied conditionally
   - Passes entire user object to onClick handler

4. **UserListPage Integration**:
   - useAuth hook to get current user ID
   - selectedUser state for dialog management
   - onClick handler passed to all UserCard components
   - UserEditDialog rendered with proper props
   - handleEditUserSuccess refreshes list and closes dialog
   - Both Add and Edit dialogs coexist without conflicts

5. **Security - Defense in Depth**:
   - **Frontend check:** Validates before API call, immediate feedback
   - **Backend check:** Validates in API function, prevents bypass
   - Both checks use same logic: userId === currentUserId AND newRole !== 'it_admin'
   - Hebrew error messages at both levels

6. **Reused Patterns from Story 5.2**:
   - ROLE_LABELS mapping for consistent Hebrew translation
   - RTL TextField/Select label positioning (right: 22px)
   - Snackbar success/error pattern
   - Dialog structure and styling
   - refetch() pattern for list refresh

**Build Verification:**
- TypeScript compilation: ✅ PASS (zero errors)
- Vite build: ✅ SUCCESS (25.05s)
- Fixed import path for useAuth (from hooks not context)
- Removed unused TextField import from UserEditDialog
- All type safety validated

**Testing Notes:**
- Self-demotion prevention works at both frontend and backend
- Role changes are immediate in database
- User list refreshes automatically after changes
- Dialog UX is simple and focused (role only)
- Hebrew RTL layout maintained throughout
- Success/error messaging in Hebrew

**Foundation for Future Stories:**
- Story 5.4 (Remove User) can use similar self-deletion prevention
- Story 5.5 (Password Reset) can extend edit dialog or create separate one
- Pattern established for user management operations

### File List

**Files Created:**
- `safety-first/src/features/users/components/UserEditDialog.tsx` - User role edit dialog with self-demotion prevention

**Files Modified:**
- `safety-first/src/features/users/api.ts` - Added updateUserRole() function with backend self-demotion check
- `safety-first/src/features/users/components/UserCard.tsx` - Added onClick prop and clickable behavior
- `safety-first/src/features/users/pages/UserListPage.tsx` - Integrated UserEditDialog with Auth context
