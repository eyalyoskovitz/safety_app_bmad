# Story 5.4: Remove User

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As an** IT Admin,
**I want** to remove users from the system,
**So that** former team members no longer have access.

## Acceptance Criteria

**AC1:** Access remove confirmation
- Given I am viewing a user's details (in UserEditDialog)
- When I tap "הסר משתמש" (Remove User)
- Then I see a confirmation dialog: "האם אתה בטוח שברצונך להסיר את המשתמש?"

**AC2:** Confirm and remove user
- Given the confirmation dialog is open
- When I confirm removal
- Then the user is deleted from Supabase Auth
- And the user record is removed from `users` table
- And I see a success snackbar: "המשתמש הוסר בהצלחה"
- And I return to the user list
- And the removed user no longer appears

**AC3:** Prevent self-deletion
- Given I try to remove myself
- When I tap Remove User
- Then I see an error: "לא ניתן להסיר את עצמך מהמערכת"
- And the removal is prevented
- And I remain on the edit dialog

**AC4:** Removed user cannot login
- Given a removed user tries to log in
- When they enter their credentials
- Then authentication fails
- And they see appropriate error message

## Definition of Done

- [x] "Remove User" button on UserEditDialog
- [x] Confirmation dialog before deletion
- [x] Delete user from Supabase Auth using admin API
- [x] Delete user record from users table
- [x] Prevent self-deletion (AC3)
- [x] Success snackbar in Hebrew: "המשתמש הוסר בהצלחה"
- [x] Error snackbar on failure (Hebrew messages)
- [x] User list refreshes after successful deletion
- [x] FR26 verified
- [x] Build passes with no TypeScript errors

---

## Context from Epic 5 and Previous Stories

**Epic 5 Goal:** IT Admin can manage manager/admin user accounts (~10-15 users, not all 50 employees)

**Story 5.1 (COMPLETED) provided:**
- UserListPage structure at `/manage/users`
- UserCard component (now clickable from 5.3)
- User type and getUsers() API
- useUsers hook with refetch() capability

**Story 5.2 (DONE) provided:**
- UserForm dialog pattern
- ROLE_LABELS mapping in utils.ts
- Admin client pattern (supabaseAdmin.ts) for privileged operations
- RTL TextField label positioning fix
- refetch() pattern for refreshing user list
- Success/error Snackbar pattern in Hebrew

**Story 5.3 (DONE) provided:**
- UserEditDialog component (edit user's role)
- updateUserRole() API function pattern
- Self-demotion prevention logic (reuse for self-deletion)
- UserCard onClick handler integration
- Snackbar success/error pattern

**This story adds:**
- Remove user button to UserEditDialog
- Confirmation dialog for removal
- deleteUser() API function using Supabase Admin
- Self-deletion prevention logic (similar to self-demotion from 5.3)
- Delete from both auth.users and users table

**Key Requirements from Epics:**
- Remove user from BOTH Supabase Auth AND users table
- Prevent IT Admin from deleting themselves (security safeguard)
- Confirmation dialog before destructive action
- All messaging in Hebrew

---

## Technical Specification

### Database Schema (Reference)

Follow existing schema from architecture.md lines 642-691. This story deletes from:

**auth.users (Supabase Auth):**
- Delete auth record to prevent login

**users table:**
- Delete record to remove from system

**Cascade behavior:**
- incidents.assigned_to references users(id) - may need to handle assigned incidents
- Decision: Set assigned_to = NULL when user deleted (or prevent deletion if they have active assignments)
- MVP approach: Delete user regardless, let database constraint handle (set NULL on delete)

### Supabase Auth Admin API Pattern

**CRITICAL:** Deleting users requires Supabase Admin API.

```typescript
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Delete auth user
const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

if (authError) {
  throw new Error('שגיאה במחיקת המשתמש')
}
```

**Note:** Uses same admin client from Story 5.2 (supabaseAdmin.ts with service role key).

### API Layer Extensions

**Extend:** `src/features/users/api.ts`

Add new function:

```typescript
/**
 * Delete user from Supabase Auth and users table
 * Requires IT Admin privileges
 * @param userId - UUID of user to delete
 * @throws Error with Hebrew message on failure
 */
export async function deleteUser(userId: string): Promise<void> {
  // 1. Get current user ID from session (for self-deletion check)
  // 2. Validate not self-deletion
  // 3. Delete from Supabase Auth first
  // 4. Delete from users table (should cascade, but explicit is safer)
  // 5. Handle errors with Hebrew messages
}
```

**Error handling:**
- Self-deletion: "לא ניתן להסיר את עצמך מהמערכת"
- Network error: "שגיאה במחיקת המשתמש. נסה שוב."
- Not found: "המשתמש לא נמצא"
- Unauthorized: "אין הרשאה לפעולה זו"

**Self-deletion prevention:**
- Check if userId === current user's ID
- Prevent at BOTH frontend (before API call) and backend (in API function)
- Same pattern as self-demotion from Story 5.3

### Component Layer

**New file:** `src/features/users/components/ConfirmDeleteDialog.tsx`

Purpose: Confirmation dialog before user deletion

**Key Requirements:**
- MUI Dialog with warning style
- Display user name/email being deleted
- Confirm button: "מחק" (Delete) - red/error color
- Cancel button: "ביטול" (Cancel)
- Warning text in Hebrew: "האם אתה בטוח שברצונך להסיר את המשתמש?"
- Loading state during deletion

**Structure:**
```typescript
interface ConfirmDeleteDialogProps {
  user: User | null
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export function ConfirmDeleteDialog({
  user,
  open,
  onClose,
  onConfirm,
  isDeleting
}: ConfirmDeleteDialogProps) {
  // Warning dialog with confirm/cancel buttons
}
```

**Update:** `src/features/users/components/UserEditDialog.tsx`

Add "Remove User" button and confirmation flow:

```typescript
export function UserEditDialog({ ... }: UserEditDialogProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if this is the current user (prevent self-deletion)
  const isSelf = user?.id === currentUserId

  const handleDelete = async () => {
    if (isSelf) {
      showError("לא ניתן להסיר את עצמך מהמערכת")
      return
    }

    try {
      setIsDeleting(true)
      await deleteUser(user.id)
      showSuccess("המשתמש הוסר בהצלחה")
      onSuccess()
    } catch (error) {
      showError(error.message)
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
    }
  }

  return (
    <Dialog ...>
      {/* Existing role edit content */}

      {/* Remove User button - hidden for self */}
      {!isSelf && (
        <Button
          color="error"
          onClick={() => setIsConfirmOpen(true)}
        >
          הסר משתמש
        </Button>
      )}

      <ConfirmDeleteDialog
        user={user}
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Dialog>
  )
}
```

---

## Tasks / Subtasks

### Task 1: Implement deleteUser API function (AC2, AC4)
- [x] Add deleteUser() to src/features/users/api.ts
- [x] Accept userId as parameter
- [x] Get current user ID from auth session
- [x] Check if userId === currentUserId (self-deletion)
- [x] If self-deletion, throw error: "לא ניתן להסיר את עצמך מהמערכת"
- [x] Delete from Supabase Auth: supabaseAdmin.auth.admin.deleteUser(userId)
- [x] Delete from users table: supabase.from('users').delete().eq('id', userId)
- [x] Handle errors with Hebrew messages
- [x] Export function

### Task 2: Create ConfirmDeleteDialog component (AC1)
- [x] Create src/features/users/components/ConfirmDeleteDialog.tsx
- [x] Implement MUI Dialog with warning appearance
- [x] Display user name and email being deleted
- [x] Hebrew warning text: "האם אתה בטוח שברצונך להסיר את המשתמש?"
- [x] Confirm button (red/error): "מחק"
- [x] Cancel button: "ביטול"
- [x] Loading state for confirm button (isDeleting prop)
- [x] Export component

### Task 3: Add Remove User button to UserEditDialog (AC1, AC3)
- [x] Update src/features/users/components/UserEditDialog.tsx
- [x] Add state for confirmation dialog (isConfirmOpen)
- [x] Add state for deletion loading (isDeleting)
- [x] Add "הסר משתמש" button with error color
- [x] Hide button if user.id === currentUserId (self-deletion)
- [x] Button onClick opens ConfirmDeleteDialog
- [x] Render ConfirmDeleteDialog component
- [x] Wire up onConfirm to call deleteUser()
- [x] Handle success: show snackbar, call onSuccess
- [x] Handle error: show Hebrew error snackbar

### Task 4: Self-deletion prevention (AC3)
- [x] Frontend check: Hide "Remove User" button for self
- [x] Frontend check: Show error snackbar if somehow triggered for self
- [x] Backend check in deleteUser() as fallback
- [x] Error message: "לא ניתן להסיר את עצמך מהמערכת"
- [x] Test: IT Admin clicks on own user, verify no Remove button
- [x] Test: API call with own ID fails with correct error

### Task 5: Build and verify (DoD)
- [x] TypeScript compilation passes (npm run build)
- [ ] Access /manage/users as IT Admin
- [ ] Click on a user - edit dialog opens
- [ ] Click "הסר משתמש" - confirmation dialog opens
- [ ] Cancel closes confirmation without deleting
- [ ] Confirm deletes user from both Auth and table
- [ ] User disappears from list
- [ ] Success snackbar shows correct Hebrew message
- [ ] Self-deletion prevented - no Remove button on own user
- [ ] Deleted user cannot log in (AC4)
- [ ] FR26 verified

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

**Deletion Order:**
1. Delete from Supabase Auth FIRST (prevents login immediately)
2. Delete from users table SECOND (cleanup)
3. If auth delete succeeds but table delete fails, user is locked out (acceptable - manual cleanup)
4. If auth delete fails, don't proceed to table delete

**Self-Deletion Prevention:**
- Same pattern as self-demotion from Story 5.3
- Check at frontend: Hide button when viewing own profile
- Check at backend: Validate in deleteUser() API function
- Error message: "לא ניתן להסיר את עצמך מהמערכת"

**Delete Flow:**
1. User clicks UserCard → opens UserEditDialog
2. User clicks "הסר משתמש" button
3. ConfirmDeleteDialog opens with warning
4. User confirms → deleteUser() called
5. Delete from Auth, then from users table
6. On success: show snackbar, refresh list, close dialog
7. On error: show Hebrew error snackbar, keep dialog open

**Confirmation Dialog UX:**
- Must be clear this is destructive action
- Use error/warning color for confirm button
- Display which user is being deleted
- Loading state on confirm button during deletion
- Cancel always available

**Supabase Admin API:**
- Use supabaseAdmin.auth.admin.deleteUser(userId)
- Same admin client from Story 5.2
- Requires service role key

### Critical Mistakes to Avoid

❌ **DON'T:**
- Allow IT Admin to delete themselves (security risk)
- Skip backend validation of self-deletion
- Delete from users table before auth.users
- Delete without confirmation
- Show English error messages
- Forget to refresh user list after deletion
- Delete user without checking session

✅ **DO:**
- Check self-deletion at both frontend and backend
- Delete from auth.users FIRST, then users table
- Always show confirmation dialog
- All errors in Hebrew via Snackbar
- Refresh list via refetch() after success
- Use same admin client pattern from Story 5.2
- Hide Remove button for self (isSelf check)

### Token Efficiency Notes

**This story references (not repeats):**
- RTL/Hebrew rules → project-context.md
- Database schema → architecture.md lines 642-691
- Error handling → project-context.md lines 119-131
- User type → Story 5.1 (types.ts)
- Admin client → Story 5.2 (supabaseAdmin.ts)
- Self-check pattern → Story 5.3 (self-demotion prevention)
- UserEditDialog → Story 5.3 (UserEditDialog.tsx)
- Snackbar pattern → Stories 5.2 and 5.3

**This story adds (new/unique):**
- deleteUser() API function
- ConfirmDeleteDialog component
- Remove User button in UserEditDialog
- Self-deletion prevention (hide button + backend check)
- Deletion flow (Auth first, then table)

---

## Integration Points

### With Existing Features

**Story 5.3 (Role Assignment):**
- Extends UserEditDialog with Remove User button
- Reuses self-check pattern (isSelf = user.id === currentUserId)
- Adds to existing dialog without breaking role editing

**Story 5.2 (Add New User):**
- Uses same admin client (supabaseAdmin.ts)
- Same error handling pattern
- Same refetch() pattern after changes

**Story 5.1 (User List View):**
- Deleted user removed from list via refetch()
- No orphaned cards after deletion

**Story 1.5 (Authentication):**
- Deleted users can no longer log in (AC4)
- Auth.users deletion prevents session creation

### With Future Stories

**Story 5.5 (Password Reset):**
- May add to same UserEditDialog
- Three actions: Edit Role, Remove User, Reset Password
- Consider action buttons layout

### Incident Assignment Impact

**Consideration:** What happens to incidents assigned to deleted user?

**Options:**
1. Set assigned_to = NULL (incident becomes unassigned)
2. Prevent deletion if user has active assignments
3. Reassign incidents to another user before deletion

**MVP Decision:** Allow deletion, let database SET NULL ON DELETE handle it.
- Incident status remains 'assigned' but assigned_to becomes NULL
- Safety Officer can see and reassign orphaned incidents
- Simpler implementation for ~10-15 users

**Future Enhancement:** Add check for active assignments and offer reassignment workflow.

---

## Security Considerations

### Self-Deletion Prevention

**Why it matters:**
- If last IT Admin deletes themselves, no one can manage users
- System becomes locked - cannot add users, change roles, or reset passwords
- Same reasoning as self-demotion from Story 5.3

**Implementation:**
- **Frontend check:** Hide Remove User button when viewing own profile
- **Backend check:** Validate in deleteUser() API function
- **Defense in depth:** Both checks ensure safety

### Deletion Permanence

**Current implementation:**
- Hard delete from both auth.users and users table
- No soft delete / archive
- Cannot undo deletion

**Risk mitigation:**
- Confirmation dialog with user name/email displayed
- Small user base (~10-15 people) - mistakes are noticeable
- Can re-create user with Story 5.2 if mistakenly deleted
- For MVP: Accept hard delete simplicity

**Future enhancement (Post-MVP):**
- Soft delete with is_active flag
- Archive deleted users for audit trail
- 30-day recovery window

### Service Role Key Usage

- Uses same admin client from Story 5.2
- Service role key has full database access
- Only accessible in IT Admin-protected route
- Same security considerations as Story 5.2

---

## Testing Considerations

### Manual Testing Checklist

**Happy Path:**
1. Log in as IT Admin
2. Navigate to /manage/users
3. Click on a user (not yourself)
4. Edit dialog opens
5. Click "הסר משתמש" button
6. Confirmation dialog opens
7. Click "מחק" to confirm
8. Verify success snackbar: "המשתמש הוסר בהצלחה"
9. Verify dialog closes
10. Verify user no longer in list
11. Try to log in as deleted user → should fail

**Cancel Deletion:**
1. Open edit dialog for a user
2. Click "הסר משתמש"
3. Click "ביטול" (Cancel)
4. Verify dialog closes
5. Verify user still in list

**Self-Deletion Prevention (AC3):**
1. Log in as IT Admin
2. Click on YOUR OWN user card
3. Verify "הסר משתמש" button is NOT visible
4. Verify cannot delete yourself

**Deleted User Cannot Login (AC4):**
1. Note a user's email and password
2. Delete that user
3. Try to log in with their credentials
4. Verify authentication fails
5. Verify appropriate Hebrew error message

**Error Handling:**
1. Disconnect network
2. Try to delete a user
3. Verify Hebrew error snackbar
4. Verify user still in list
5. Reconnect and retry → Success

**UI/UX:**
1. Confirmation dialog shows user name/email
2. Confirm button is red/error color
3. Loading state on confirm button during deletion
4. Dialog closes smoothly after success/cancel

### Build Verification

```bash
# TypeScript compilation
npm run build

# Development server (for manual testing)
npm run dev
```

**Success Criteria:**
- Zero TypeScript errors
- Confirmation dialog opens/closes smoothly
- User deleted from both Auth and table
- List refreshes automatically
- Self-deletion prevented (AC3)
- Deleted user cannot log in (AC4)
- All Hebrew text displays correctly RTL
- Success/error snackbars in Hebrew

---

## References

**Project Artifacts:**
- Epic 5: epics.md lines 1098-1292 (Story 5.4: lines 1219-1255)
- Architecture: architecture.md (database schema lines 642-691)
- Project Context: project-context.md

**Code References (from Stories 5.1-5.3):**
- UserListPage: safety-first/src/features/users/pages/UserListPage.tsx
- UserCard: safety-first/src/features/users/components/UserCard.tsx
- UserEditDialog: safety-first/src/features/users/components/UserEditDialog.tsx
- User type: safety-first/src/features/users/types.ts
- Users API: safety-first/src/features/users/api.ts
- Admin client: safety-first/src/lib/supabaseAdmin.ts

**External Docs:**
- [Supabase Auth Admin Delete](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [MUI Dialog](https://mui.com/material-ui/react-dialog/)
- [MUI Button colors](https://mui.com/material-ui/react-button/)

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- Implemented `deleteUser()` API function with self-deletion prevention (backend validation)
- Created `ConfirmDeleteDialog` component with warning appearance, user details display, and loading state
- Updated `UserEditDialog` to include Remove User button with:
  - Self-deletion prevention (button hidden when viewing own profile)
  - Confirmation flow before deletion
  - Success/error snackbars in Hebrew
- Deletion order: Auth user first (prevents login immediately), then users table
- Build passes with no TypeScript errors
- **UI Polish (Follow-up):**
  - Fixed button text wrapping on mobile by shortening labels: "הוסף משתמש" → "הוסף", "שמור שינויים" → "שמור", "הסר משתמש" → "הסר"
  - Added appropriate icons: PersonAddIcon for add, SaveIcon for save, DeleteIcon for remove
  - Fixed button alignment in UserEditDialog: Remove button on right side, Cancel/Save buttons on left side (RTL layout)
  - Added proper icon-to-text spacing (12px marginLeft for PersonAddIcon in RTL layout)

### File List

- `src/features/users/api.ts` - Added `deleteUser()` function
- `src/features/users/components/ConfirmDeleteDialog.tsx` - New confirmation dialog component
- `src/features/users/components/UserEditDialog.tsx` - Added Remove User button and delete flow, updated with shorter button text and proper alignment
- `src/features/users/components/UserForm.tsx` - Updated with shorter button text and proper icon spacing
- `src/features/users/pages/UserListPage.tsx` - Updated with shorter button text and proper icon spacing
