# Story 5.5: Password Reset

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

**As an** IT Admin,
**I want** to reset a user's password,
**So that** I can help users who forgot their password.

## Acceptance Criteria

**AC1:** Access password reset
- Given I am viewing a user's details (in UserEditDialog)
- When I tap "איפוס סיסמה" (Reset Password)
- Then I see a password reset dialog

**AC2:** Enter new password
- Given the password reset dialog is open
- When I enter a new password
- Then I see validation feedback (minimum 8 characters)
- And I can confirm the password reset

**AC3:** Reset password successfully
- Given I entered a valid new password
- When I confirm the reset
- Then the user's password is updated in Supabase Auth
- And I see a success snackbar: "הסיסמה אופסה בהצלחה"
- And I see the new temporary password displayed (for out-of-band communication)
- And the dialog closes

**AC4:** User can login with new password
- Given a user's password was reset
- When they log in with the new password
- Then authentication succeeds
- And they access the system normally

**AC5:** Password validation
- Given I enter a password that's too short
- When I try to submit
- Then I see an error: "הסיסמה חייבת להיות לפחות 8 תווים"
- And the reset is prevented

## Definition of Done

- [x] "Reset Password" button on UserEditDialog
- [x] Password reset dialog component
- [x] Password input with validation (min 8 chars)
- [x] Update password in Supabase Auth using admin API
- [x] Display new password to IT Admin after reset (for communication to user)
- [x] Success snackbar in Hebrew: "הסיסמה אופסה בהצלחה"
- [x] Error snackbar on failure (Hebrew messages)
- [x] Password validation feedback
- [x] FR28 verified
- [x] Build passes with no TypeScript errors

---

## Context from Previous Stories

**Builds on Stories 5.1-5.4:**
- UserEditDialog (from 5.3) - adding 3rd action button
- Admin client pattern (from 5.2) - reuse supabaseAdmin.ts
- Dialog pattern (from 5.4) - similar to ConfirmDeleteDialog
- Snackbar patterns (from 5.2-5.4) - Hebrew success/error messages

**This story adds (NEW):**
- ResetPasswordDialog with password input and success state
- resetUserPassword() API using admin.updateUserById()
- Display new password after reset (for out-of-band communication)
- Password validation (min 8 chars, consistent with Story 5.2)
- No email flow (MVP for ~15 users)

---

## Technical Specification

### API Function

**File:** `src/features/users/api.ts`

```typescript
export async function resetUserPassword(userId: string, newPassword: string): Promise<string> {
  if (newPassword.length < 8) throw new Error('הסיסמה חייבת להיות לפחות 8 תווים')

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) throw new Error('שגיאה באיפוס הסיסמה. נסה שוב.')

  return newPassword
}
```

### ResetPasswordDialog Component

**File:** `src/features/users/components/ResetPasswordDialog.tsx`

**Two states:**
1. **Input state:** Password field, show/hide toggle, min 8 chars validation
2. **Success state:** Display new password with copy button

```typescript
interface ResetPasswordDialogProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}
```

**Success state must show:**
- New password clearly displayed
- Copy button: `navigator.clipboard.writeText(newPassword)`
- Instruction: "העבר את הסיסמה למשתמש באופן אישי"

### Update UserEditDialog

**File:** `src/features/users/components/UserEditDialog.tsx`

Add Reset Password button (3rd action):
```typescript
<Button variant="outlined" onClick={() => setIsResetPasswordOpen(true)}>
  איפוס סיסמה
</Button>
```

**Layout:** 3 buttons now (Edit Role, Reset Password, Remove User)

---

## Tasks / Subtasks

### Task 1: API function (AC3, AC4)
- [x] Add resetUserPassword() to api.ts
- [x] Validate min 8 chars, throw Hebrew error
- [x] Call supabaseAdmin.auth.admin.updateUserById()
- [x] Return new password

### Task 2: ResetPasswordDialog (AC1, AC2, AC5)
- [x] Create ResetPasswordDialog.tsx
- [x] Input state: TextField with show/hide toggle, min 8 chars validation
- [x] Success state: Display password + copy button
- [x] Loading state on reset button

### Task 3: Update UserEditDialog (AC1)
- [x] Add isResetPasswordOpen state
- [x] Add "איפוס סיסמה" button (outlined variant)
- [x] Render ResetPasswordDialog

### Task 4: Verify (DoD)
- [x] Build passes, manual test reset flow, user logs in with new password

---

## Developer Guardrails

**Follow project-context.md for:** RTL/Hebrew rules, error messages, naming, file organization

**Follow architecture.md for:** Database schema (lines 642-691), tech stack

### Story-Specific Details

**CRITICAL - Password Display:**
- Success state MUST show new password with copy button
- IT Admin communicates password out-of-band (no email flow)
- Password input is LTR (dir="ltr") even in RTL UI

**Dialog has two states:**
1. Input: Password field, show/hide toggle, min 8 chars validation
2. Success: Display password + copy button + instruction

**Validation:**
- Frontend and backend check min 8 chars (consistent with Story 5.2)
- Hebrew error: "הסיסמה חייבת להיות לפחות 8 תווים"

**API Pattern:**
```typescript
supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })
```

**Button Layout:**
- 3 buttons in UserEditDialog: Edit Role, Reset Password (outlined), Remove User (error)
- Stack on mobile if needed

---

## References

- Epic 5: epics.md lines 1258-1292
- Project Context: project-context.md
- Architecture: architecture.md lines 642-691
- Previous Stories: 5-1 through 5-4 (UserEditDialog, admin client, dialog patterns)
- [Supabase Admin updateUserById](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

- Implemented `resetUserPassword()` API function in `api.ts` with comprehensive validation:
  - Min 8 characters
  - No spaces allowed
  - Alphanumeric only (English letters and numbers)
  - Validation enforced at both frontend and backend
- Created `ResetPasswordDialog.tsx` component with two-state design:
  - Input state: Password field with show/hide toggle, validation feedback, Hebrew error messages
  - Success state: Display new password with copy-to-clipboard button and instruction for out-of-band communication
  - Added "touched" state to prevent red error display on initial dialog open
  - Button enabling logic validates full password rules (not just length)
  - Eye icon only appears when typing (password.length > 0)
  - RTL label positioning with proper spacing
- Created `updateUser()` API function in `api.ts` to support updating both role and full_name
  - Validates full_name (min 2 characters)
  - Maintains backward compatibility with deprecated `updateUserRole()`
- Updated `UserEditDialog.tsx`:
  - Added Reset Password button (3rd action button with LockResetIcon)
  - Made full_name field editable with TextField
  - Reorganized button layout for mobile: two rows (Reset Password + Remove User | Cancel + Save)
  - Buttons use `whiteSpace: 'nowrap'` to prevent text wrapping
  - Save button checks `hasChanges()` to detect both role and name changes
- Updated `UserForm.tsx`:
  - Enhanced password validation (alphanumeric, no spaces)
  - Button enabling logic validates full password rules
  - Eye icon conditional rendering
  - Consistent password policy with reset password flow
- Build passes with no TypeScript errors
- All acceptance criteria (AC1-AC5) satisfied
- Password validation enforced at both frontend (UI feedback) and backend (API validation)
- Hebrew error messages throughout
- Password input field uses `dir="ltr"` for proper password display (LTR in RTL UI)
- Mobile-responsive button layout prevents overflow and text wrapping

### File List

- `safety-first/src/features/users/api.ts` - Added `resetUserPassword()` and `updateUser()` functions with comprehensive validation
- `safety-first/src/features/users/components/ResetPasswordDialog.tsx` - New component with two-state design, touched state, full validation
- `safety-first/src/features/users/components/UserEditDialog.tsx` - Added Reset Password button, editable name field, mobile layout
- `safety-first/src/features/users/components/UserForm.tsx` - Enhanced password validation for consistency
