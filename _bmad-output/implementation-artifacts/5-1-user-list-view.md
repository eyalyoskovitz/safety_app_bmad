# Story 5.1: User List View

Status: done

## Story

**As an** IT Admin,
**I want** to view all users and their roles,
**So that** I can see who has access to the system.

## Acceptance Criteria

**AC1:** Access User Management page
- Given I am logged in as IT Admin
- When I navigate to User Management
- Then I see a list of all users
- And each user shows: name, email, role
- And the list is sorted alphabetically by name

**AC2:** Role display with visual indicator
- Given I am viewing the user list
- When I look at a user entry
- Then I can see their role displayed as a chip/badge
- And I can identify IT Admins, Safety Officers, Plant Managers, and Managers

**AC3:** Access restriction
- Given I am NOT an IT Admin
- When I try to access User Management
- Then I am shown an access denied message or the menu item is hidden

## Definition of Done

- [x] User Management menu item (visible only to IT Admin)
- [x] `UserListPage` component at `/manage/users`
- [x] Query all users from database
- [x] Display name, email, role for each user
- [x] Role shown as colored chip
- [x] Access restricted to IT Admin role
- [x] FR27, FR36 verified
- [x] Build passes with no TypeScript errors

---

## Context from Previous Stories

**Epic 1-4 (COMPLETED) provided foundation:**

**Story 1.5 (COMPLETED):** Auth system
- `AuthContext` and `useAuth` hook at `safety-first/src/features/auth/context/AuthContext.tsx`
- User object includes `role` field
- Session management via Supabase Auth

**Story 1.6 (COMPLETED):** Role-based routing
- `RoleRoute` component at `safety-first/src/routes/RoleRoute.tsx`
- Pattern for restricting routes by role
- Access denied handling with Hebrew message

**Story 3.1 (COMPLETED):** List view pattern
- `IncidentListPage` at `safety-first/src/features/incidents/pages/IncidentListPage.tsx`
- Card-based list layout
- Fetch data on mount using useEffect
- Error handling with Hebrew Snackbar

**Story 3.4 (COMPLETED):** User data fetching
- Pattern for querying users table from Supabase
- Used in AssignmentSheet for manager selection

**Story 4.4 (COMPLETED):** Role chip pattern
- StatusChip component pattern with semantic colors
- Used for displaying status with colored badges

**This story creates NEW user management feature:**
- First story in Epic 5 (User Management)
- Creates new `/features/users/` module
- Introduces IT Admin-only functionality
- Foundation for Stories 5.2-5.5

---

## Technical Specification

### Database Schema (Reference)

See architecture.md lines 642-691. This story uses existing schema:

**users table** (all columns needed for display):
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

**Roles:** manager, it_admin
**Note:** Only managers/admins (~10-15 users) have accounts. Production line employees use public reporting without accounts.

### Feature Structure (NEW)

Create new feature module at `src/features/users/`:

```
src/features/users/
├── components/
│   └── UserCard.tsx         # User list item component (this story)
├── hooks/
│   └── useUsers.ts          # Fetch users hook (this story)
├── pages/
│   └── UserListPage.tsx     # Main user management page (this story)
├── api.ts                   # Supabase user queries (this story)
├── types.ts                 # User types (this story)
└── index.ts                 # Public exports (this story)
```

### API Layer

**New file:** `src/features/users/api.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { User } from './types'

/**
 * Fetch all users sorted by full name
 * Used by UserListPage to display all system users
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Failed to fetch users:', error)
    throw new Error('שגיאה בטעינת רשימת משתמשים')
  }

  return data || []
}
```

**Pattern Notes:**
- Follows existing api.ts pattern from incidents feature
- Hebrew error message per project-context.md
- Returns empty array as fallback
- Orders by full_name (AC1 requirement)

### Types Layer

**New file:** `src/features/users/types.ts`

```typescript
/**
 * User type matching database schema
 * Role restricted to manager | it_admin
 */
export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'manager' | 'it_admin'
  created_at: string
  updated_at: string
}
```

**Note:** Type must match database schema exactly. No "reporter" role - production employees don't have accounts.

### Component Layer

**New file:** `src/features/users/components/UserCard.tsx`

Purpose: Display individual user in list with name, email, and role chip

Key Requirements:
- Card layout similar to IncidentCard pattern
- Display full_name, email
- Role chip with semantic colors (similar to StatusChip)
- Hebrew labels
- RTL layout per project-context.md

Role Chip Colors:
- `it_admin`: Blue (#1976d2) - highest privilege
- `manager`: Gray (#757575) - standard role

**Structure:**
```typescript
interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  // MUI Card with user info
  // Use Chip for role with semantic color
  // Typography for name (variant="h6") and email (variant="body2")
}
```

**Pattern Reference:** See IncidentCard.tsx for card layout pattern and StatusChip for chip styling.

**New file:** `src/features/users/pages/UserListPage.tsx`

Purpose: Main user management page listing all users

Key Requirements:
- Fetch users on mount using useUsers hook
- Display in card-based list (similar to IncidentListPage)
- Loading state during fetch
- Error state with Hebrew message
- Empty state if no users (shouldn't happen but good practice)
- Header with "ניהול משתמשים" (User Management) title

**Structure:**
```typescript
export function UserListPage() {
  const { users, isLoading, error } = useUsers()

  // Loading state
  // Error state
  // Empty state (edge case)
  // List of UserCard components
}
```

**Pattern Reference:** See IncidentListPage.tsx lines 1-200 for page structure, loading/error/empty states.

**New file:** `src/features/users/hooks/useUsers.ts`

Purpose: React hook to fetch and manage users list

```typescript
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true)
        const data = await getUsers()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת משתמשים')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return { users, isLoading, error }
}
```

**Pattern Reference:** Similar to useIncidents hook pattern.

### Routing Integration

**Modify:** `src/App.tsx` or `src/routes/index.tsx`

Add new route for User Management:

```typescript
<Route
  path="/manage/users"
  element={
    <RoleRoute allowedRoles={['it_admin']}>
      <UserListPage />
    </RoleRoute>
  }
/>
```

**Critical:** Route MUST use RoleRoute with `allowedRoles={['it_admin']}` to enforce AC3.

### Navigation Integration (Future Enhancement)

**Note:** This story creates the page but does NOT add navigation menu item. That will be handled in a future story when we implement the full admin menu.

For testing this story, access directly via URL: `/manage/users`

---

## Tasks

### Task 1: Create users feature structure (Foundation)
- [x] Create `src/features/users/` directory
- [x] Create subdirectories: `components/`, `hooks/`, `pages/`
- [x] Create empty files: `api.ts`, `types.ts`, `index.ts`

### Task 2: Define User types (AC1, AC2)
- [x] Create `src/features/users/types.ts`
- [x] Define User interface matching database schema
- [x] Export User type

### Task 3: Implement API layer (AC1)
- [x] Create `src/features/users/api.ts`
- [x] Implement getUsers() function
- [x] Query users table, order by full_name ascending
- [x] Add error handling with Hebrew message
- [x] Export function

### Task 4: Create useUsers hook (AC1)
- [x] Create `src/features/users/hooks/useUsers.ts`
- [x] Implement useState for users, isLoading, error
- [x] Implement useEffect to fetch on mount
- [x] Call getUsers() from api layer
- [x] Handle loading, success, and error states
- [x] Export hook

### Task 5: Create UserCard component (AC1, AC2)
- [x] Create `src/features/users/components/UserCard.tsx`
- [x] Implement Card layout with user info
- [x] Display full_name with Typography h6
- [x] Display email with Typography body2
- [x] Add role Chip with semantic colors (blue for it_admin, gray for manager)
- [x] Use Hebrew labels
- [x] Follow RTL layout rules from project-context.md
- [x] Export component

### Task 6: Create UserListPage (AC1, AC2)
- [x] Create `src/features/users/pages/UserListPage.tsx`
- [x] Import and use useUsers hook
- [x] Implement loading state (CircularProgress)
- [x] Implement error state (Alert with Hebrew message)
- [x] Implement empty state (shouldn't happen but include for completeness)
- [x] Map users to UserCard components
- [x] Add page header "ניהול משתמשים"
- [x] Use Container and Box for layout
- [x] Export component

### Task 7: Add route protection (AC3)
- [x] Open routing file (`src/App.tsx` or `src/routes/index.tsx`)
- [x] Add route for `/manage/users`
- [x] Wrap UserListPage with RoleRoute component
- [x] Set `allowedRoles={['it_admin']}`
- [x] Verify non-admin users cannot access

### Task 8: Create index.ts for public exports
- [x] Create `src/features/users/index.ts`
- [x] Export UserListPage
- [x] Export User type
- [x] Export useUsers hook (for potential reuse)

### Task 9: Build and verify (DoD)
- [x] TypeScript compilation passes (npm run build)
- [x] Access /manage/users as IT Admin - see user list
- [x] Access /manage/users as Manager - see access denied
- [x] User list sorted alphabetically by full_name
- [x] Role chips display correct colors
- [x] All Hebrew labels correct
- [x] FR27, FR36 verified

---

## Developer Guardrails

### Reference Project Rules

**ALWAYS follow (don't repeat in story):**
- **RTL layout, Hebrew labels, date formats:** See project-context.md
- **Database schema and users table:** See architecture.md lines 642-691
- **Error messages in Hebrew:** See project-context.md lines 119-131
- **Naming conventions:** See architecture.md lines 328-351
- **File organization:** See architecture.md lines 354-372

### Story-Specific Patterns

**Role-Based Access Pattern (from Story 1.6):**
```typescript
<RoleRoute allowedRoles={['it_admin']}>
  <UserListPage />
</RoleRoute>
```

**List Page Pattern (from Story 3.1):**
- Container with maxWidth="lg"
- Header with page title
- Loading state: CircularProgress centered
- Error state: Alert with error message
- Map data to Card components

**Card Component Pattern (from Story 3.1):**
- MUI Card with sx prop for styling
- CardContent for content area
- Typography for text hierarchy
- Chip for role badges

**Hook Pattern (from Story 3.1):**
```typescript
const [data, setData] = useState<Type[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  async function fetchData() {
    try {
      setIsLoading(true)
      const result = await apiFunction()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  fetchData()
}, [])
```

**Role Chip Colors:**
- IT Admin: Blue (#1976d2) - highest privilege level
- Manager: Gray (#757575) - standard management role

**Hebrew Labels:**
- User Management: "ניהול משתמשים"
- Name: "שם"
- Email: "אימייל"
- Role: "תפקיד"
- IT Admin: "מנהל מערכת"
- Manager: "מנהל"

### Critical Mistakes to Avoid

❌ **DON'T:**
- Create "reporter" role (employees don't have accounts)
- Forget RoleRoute wrapper for /manage/users
- Use English labels or error messages
- Fetch users without ordering by full_name
- Create complex user CRUD in this story (that's Stories 5.2-5.5)
- Add navigation menu (that's a future enhancement)
- Ignore loading/error states

✅ **DO:**
- Restrict access to IT Admin only via RoleRoute
- Use Hebrew for all user-facing text
- Order users by full_name (AC1)
- Create new feature module structure
- Follow existing patterns from IncidentListPage
- Display role as colored chip
- Handle loading/error states properly

### Token Efficiency Notes

**This story references (not repeats):**
- RTL/Hebrew rules → project-context.md
- Database schema → architecture.md lines 642-691
- Naming conventions → architecture.md lines 328-351
- Error handling → project-context.md lines 119-131
- RoleRoute pattern → Story 1.6 (RoleRoute.tsx)
- List page pattern → Story 3.1 (IncidentListPage.tsx)
- Card pattern → Story 3.1 (IncidentCard.tsx)

**This story adds (new/unique):**
- New users feature module structure
- UserListPage for IT Admin
- UserCard component with role chips
- getUsers() API function
- useUsers hook
- IT Admin-only access restriction
- Foundation for Stories 5.2-5.5

---

## Integration Points

### With Existing Features

**Auth Feature (Story 1.5):**
- Uses `useAuth` hook to get current user
- Checks user.role for IT Admin verification

**Routing (Story 1.6):**
- Uses `RoleRoute` component for access control
- Integrates into existing route structure

**Supabase Client:**
- Uses existing supabase client from `lib/supabase.ts`
- Follows same query pattern as incidents feature

### With Future Stories

**Story 5.2 (Add New User):**
- Will add "Add User" button to UserListPage
- Will use getUsers() to refresh list after add
- Will create UserForm component

**Story 5.3 (Role Assignment):**
- Will make role chip clickable/editable
- Will add inline or dialog edit for role

**Story 5.4 (Remove User):**
- Will add delete action to UserCard
- Will use getUsers() to refresh list after delete

**Story 5.5 (Password Reset):**
- Will add reset password action to UserCard
- Will use Supabase Auth admin functions

---

## Testing Considerations

### Manual Testing Checklist

**As IT Admin:**
1. Navigate to `/manage/users`
2. Verify user list displays
3. Verify users sorted alphabetically
4. Verify each card shows name, email, role chip
5. Verify role chip colors (blue for it_admin, gray for manager)
6. Verify all text is Hebrew and RTL

**As Manager:**
1. Try to navigate to `/manage/users`
2. Verify access denied message or redirect
3. Verify cannot see User Management in navigation (when implemented)

**Edge Cases:**
1. No users in database (shouldn't happen but handle gracefully)
2. Network error during fetch (show Hebrew error message)
3. Long names/emails (ensure they don't break layout)

### Build Verification

```bash
# TypeScript compilation
npm run build

# Development server (for manual testing)
npm run dev
```

**Success Criteria:**
- Zero TypeScript errors
- Zero console warnings
- Page loads within 2 seconds
- Users display in alphabetical order
- Role chips have correct colors
- Access control works correctly

---

## References

**Project Artifacts:**
- Epic 5: epics.md lines 1098-1292
- Architecture: architecture.md
- Project Context: project-context.md

**Code References:**
- AuthContext: safety-first/src/features/auth/context/AuthContext.tsx (useAuth hook)
- RoleRoute: safety-first/src/routes/RoleRoute.tsx (access control pattern)
- IncidentListPage: safety-first/src/features/incidents/pages/IncidentListPage.tsx (list page pattern)
- IncidentCard: safety-first/src/features/incidents/components/IncidentCard.tsx (card component pattern)
- Incidents API: safety-first/src/features/incidents/api.ts (API pattern)
- Supabase Client: safety-first/src/lib/supabase.ts

**Related Stories:**
- Story 1.5 (COMPLETED) - Authentication system
- Story 1.6 (COMPLETED) - Role-based routing
- Story 3.1 (COMPLETED) - List view pattern
- Story 3.4 (COMPLETED) - User data fetching
- Story 4.4 (COMPLETED) - Chip component pattern

**External Docs:**
- [MUI Card](https://mui.com/material-ui/react-card/)
- [MUI Chip](https://mui.com/material-ui/react-chip/)
- [MUI Typography](https://mui.com/material-ui/react-typography/)
- [Supabase Select](https://supabase.com/docs/reference/javascript/select)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

**Implementation Summary:**

Successfully implemented Story 5.1: User List View - the foundation for IT Admin user management functionality.

**All Acceptance Criteria Met:**

**AC1 - Access User Management page:** Created UserListPage component accessible at `/manage/users` that displays all users with name, email, and role. Users are sorted alphabetically by full_name as required.

**AC2 - Role display with visual indicator:** Implemented role chips with semantic colors:
- IT Admin (מנהל מערכת): Blue (#1976d2) - highest privilege level
- Manager (מנהל): Gray (#757575) - standard management role

**AC3 - Access restriction:** Route is protected by both ProtectedRoute (authentication) and RoleRoute with `allowedRoles={['it_admin']}` to enforce IT Admin-only access.

**Key Implementation Details:**

1. **Feature Module Structure:** Created complete `/features/users/` module following project architecture patterns:
   - `api.ts` - Supabase queries for user data
   - `types.ts` - User interface with strict role typing ('manager' | 'it_admin')
   - `hooks/useUsers.ts` - React hook for fetching users with loading/error states
   - `components/UserCard.tsx` - User display card with role chip
   - `pages/UserListPage.tsx` - Main page with loading/error/empty states
   - `index.ts` - Public exports

2. **API Layer:** Implemented `getUsers()` function that queries users table, orders by full_name ascending, and includes Hebrew error messages per project standards.

3. **UI Components:**
   - UserCard displays user info with proper RTL layout
   - UserListPage includes comprehensive state handling (loading, error, empty)
   - Hebrew labels throughout ("ניהול משתמשים", "מנהל מערכת", "מנהל")

4. **Routing Integration:** Updated routes/index.tsx to add `/manage/users` route with proper protection layers (ProtectedRoute + RoleRoute).

5. **Type Safety:** User interface correctly defines role as union type ('manager' | 'it_admin') matching database schema, with full_name as nullable string.

**Additional Fix:**
- Fixed TypeScript error in AssignmentSheet.tsx where user.full_name was accessed without null check (added optional chaining)

**Build Verification:**
- TypeScript compilation successful: `npm run build` ✓
- Zero TypeScript errors
- All DoD criteria met

**Foundation for Future Stories:**
This story creates the foundation for Stories 5.2-5.5 (Add User, Role Assignment, Remove User, Password Reset).

**Post-Implementation Improvements:**
After initial implementation, the following UX enhancements were added based on user feedback:

1. **IT Admin Navigation Tab:** Added "משתמשים" (Users) tab to bottom navigation (visible only to IT Admin role)
2. **Back Button:** Added back button with arrow icon to UserListPage header for easy return to incident list
3. **Desktop Layout:** Updated UserCard to display users in one-line grid format (Name | Email | Role) on desktop with fixed spacing
4. **Role Fix:** Corrected auth context usage - changed from `user.role` to `role` field directly
5. **Navigation Cleanup:** Removed "שלי" (My Items) tab from all users per user request

All improvements verified with TypeScript build passing.

### File List

**Files Created:**
- `safety-first/src/features/users/api.ts` - User API queries
- `safety-first/src/features/users/types.ts` - User type definitions
- `safety-first/src/features/users/hooks/useUsers.ts` - useUsers hook
- `safety-first/src/features/users/components/UserCard.tsx` - User card component with responsive layout
- `safety-first/src/features/users/pages/UserListPage.tsx` - User list page with back button
- `safety-first/src/features/users/index.ts` - Public exports

**Files Modified:**
- `safety-first/src/routes/index.tsx` - Added /manage/users route with UserListPage and RoleRoute protection
- `safety-first/src/features/incidents/components/AssignmentSheet.tsx` - Fixed TypeScript error with null check for user.full_name
- `safety-first/src/components/layout/BottomNav.tsx` - Added IT Admin users tab, removed My Items tab, fixed role check
