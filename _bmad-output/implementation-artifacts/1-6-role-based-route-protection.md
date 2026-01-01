# Story 1.6: Role-Based Route Protection

## Story Metadata

**Story ID:** 1-6-role-based-route-protection
**Epic:** Epic 1 - Foundation & Authentication
**Status:** ready-for-dev
**Priority:** High
**Estimated Effort:** Small-Medium
**Sprint:** Sprint 1
**Dependencies:**
- Story 1.5 (User Authentication - Login/Logout) - COMPLETED
**Blocks:**
- Story 3.1+ (Incident Management - requires Safety Officer role check)
- Story 4.1+ (Incident Resolution - requires Manager role check)
- Story 5.1+ (User Management - requires IT Admin role check)

**Created:** 2026-01-01
**Last Updated:** 2026-01-01

---

## User Story

**As the** system,
**I want** to restrict access based on user roles,
**So that** users can only access features appropriate to their role.

---

## Context

### Epic Context

**Epic 1: Foundation & Authentication**

This epic establishes the technical foundation and authentication system for Safety First. Story 1.6 completes the authentication epic by adding role-based access control (RBAC) on top of the basic authentication implemented in Story 1.5.

This story creates the `RoleRoute` component that checks user roles against allowed roles for specific routes, enforces access restrictions, and displays Hebrew error messages when access is denied.

### User Context

**Roles in the System:**
- **Manager** - Can view/resolve incidents assigned to them
- **Safety Officer** - Can view/manage all incidents, assign to managers
- **Plant Manager** - Can view all incidents (read-only)
- **IT Admin** - Can manage users + access all incidents

**User Needs:**
- Managers should only see user management if they're IT Admin
- Safety Officers should have full incident management access
- Plant Managers should have read-only access to incidents
- Clear error message in Hebrew when trying to access unauthorized features

**Design-For User:** Avi (Safety Officer) - Should have full access to incident management, but not user management.

### Previous Story Learnings (Story 1.5)

**Completed Implementation:**
- `AuthContext` provides user object via `useAuth()` hook
- User object available from Supabase Auth session
- `ProtectedRoute` component exists - checks authentication only (not roles yet)
- Login/logout flow complete with Hebrew error messages
- Session management automatic via Supabase Auth

**Key Patterns Established:**
- Feature-based folders: `src/features/{feature}/`
- Type-only imports: `import type { ReactNode }` (verbatimModuleSyntax)
- Theme tokens instead of hard-coded values: `theme.spacing()`
- RTL-aware CSS: `paddingInline`, `marginInlineStart`
- React Router 7 Library Mode (single `react-router-dom` package)
- Hebrew error messages via constants

**Technical Insights:**
- User object from `useAuth()` includes user metadata
- User data queried from `users` table (already configured in Story 1.2)
- `ProtectedRoute` uses `Navigate` component for redirects
- Loading states critical to prevent flash of redirect

**Files to Reference:**
- `src/features/auth/context/AuthContext.tsx` - User object available here
- `src/features/auth/hooks/useAuth.ts` - Exposes user object
- `src/routes/ProtectedRoute.tsx` - Pattern for route guards
- `src/features/auth/types.ts` - Auth type definitions

### Architectural Considerations

**From Architecture Document:**

**Role-Based Access Control (RBAC):**
- Roles stored in `users.role` column (TEXT field)
- Valid roles: `manager`, `safety_officer`, `plant_manager`, `it_admin`
- Database-level enforcement via Row Level Security (RLS) policies
- Client-side enforcement via route guards (user experience)

**Access Control Rules:**
| Role | Access |
|------|--------|
| Manager | Assigned incidents only |
| Safety Officer | All incidents (full CRUD) |
| Plant Manager | All incidents (read-only) |
| IT Admin | All incidents + users table |

**Route Structure:**
```
Public Routes (no auth):
  /               → Public report form (Epic 2)
  /report         → Public report form (Epic 2)
  /login          → Login page

Protected Routes (auth required, role-specific):
  /manage/incidents     → All authenticated users (filtered by role via RLS)
  /manage/my-incidents  → All authenticated users (shows assigned items)
  /manage/users         → IT Admin ONLY
```

**Security Architecture:**
- **Client-Side:** RoleRoute checks user role, shows access denied or redirects
- **Server-Side:** Supabase RLS policies enforce database-level permissions
- **Error Handling:** Hebrew message "אין הרשאה לפעולה זו" (No permission for this action)

**File Organization:**
- `src/routes/RoleRoute.tsx` - New role guard component (to create)
- `src/routes/index.tsx` - Configure route restrictions
- `src/features/auth/types.ts` - Add UserRole type
- `src/lib/constants.ts` - Add access denied error message

### Latest Technical Research (2026-01-01)

**React Router 7 Role-Based Guards (2025 Best Practices):**

Modern implementations combine:
- AuthContext with `userRole` in state
- RoleRoute component accepting `allowedRoles` prop array
- Dual-layer security (client guards + server RLS)
- TypeScript for type-safe role checking

**Implementation Pattern:**
```typescript
// RoleRoute component pattern
interface RoleRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

// Usage in routes
<RoleRoute allowedRoles={['it_admin']}>
  <UserManagementPage />
</RoleRoute>
```

**Supabase Auth User Role Strategy:**

For this application's scale (~10-15 users), the recommended approach:
- Store role in `users.role` column (already in schema from Story 1.2)
- Query user record from Supabase on auth to get role
- Include role in AuthContext state
- Use RLS policies for database-level enforcement

**Alternative (not recommended for MVP):**
- Custom Access Token Hooks (adds role to JWT claims)
- More complex setup, overkill for 10-15 users
- Can be added later if JWT claims needed for other services

**Sources:**
- [Building Reliable Protected Routes with React Router v7](https://dev.to/ra1nbow1/building-reliable-protected-routes-with-react-router-v7-1ka0)
- [Role-Based Route Permissions in Remix / React Router v7](https://dev.to/princetomarappdev/role-based-route-permissions-in-remix-react-router-v7-1d3j)
- [Custom Claims & Role-based Access Control (RBAC) | Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Custom Access Token Hook | Supabase Docs](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)

---

## Acceptance Criteria

### AC1: Redirect Unauthenticated Users

**Given** I am not authenticated
**When** I try to access `/manage/*` routes
**Then** I am redirected to the login page

**Technical Details:**
- `ProtectedRoute` already handles this (implemented in Story 1.5)
- This AC verifies existing behavior still works
- No changes needed to ProtectedRoute for this AC

**Implementation Notes:**
- Test that authentication check still works
- Ensure role check doesn't break auth redirect

### AC2: Block Manager from User Management

**Given** I am authenticated as a Manager
**When** I access the user management page (`/manage/users`)
**Then** I am shown an "access denied" message or redirected to my allowed area

**Technical Details:**
- Create `RoleRoute` component
- Wrap `/manage/users` route with `<RoleRoute allowedRoles={['it_admin']}>`
- If user role is NOT in allowedRoles → show access denied
- Access denied message: "אין הרשאה לפעולה זו" (No permission for this action)

**Implementation Notes:**
- Options for "access denied":
  1. Show Hebrew error message on page
  2. Redirect to default allowed route (`/manage/incidents`)
  3. Show Snackbar with error and stay on current page
- Recommendation: Option 1 (dedicated access denied page/message) for clarity

### AC3: Allow IT Admin to User Management

**Given** I am authenticated as an IT Admin
**When** I access the user management page
**Then** the page loads successfully

**Technical Details:**
- `RoleRoute` checks if user role (`it_admin`) is in allowedRoles array
- If match found → render children (UserManagementPage)
- If no match → access denied (AC2 behavior)

**Implementation Notes:**
- User role queried from `users` table on login
- Role stored in AuthContext state
- Role check is case-sensitive: must match exactly `it_admin`

### AC4: Allow All Authenticated Users to Incident List

**Given** I am authenticated with any role
**When** I access the incident list
**Then** the page loads (all authenticated users can view incidents per their role)

**Technical Details:**
- `/manage/incidents` route wrapped with `ProtectedRoute` only (no RoleRoute)
- All authenticated users can access incident list
- Data filtering happens via Supabase RLS policies (database level)
  - Managers see only assigned incidents
  - Safety Officers see all incidents
  - Plant Managers see all incidents (read-only)

**Implementation Notes:**
- Do NOT add RoleRoute to `/manage/incidents` - all authenticated users allowed
- RLS policies (configured in Story 1.2) handle data filtering
- This ensures all user types can access the page, but see appropriate data

### AC5: Role Checked from User Record

**Given** the authentication system
**When** determining user role for access control
**Then** the role is checked from the user record in the database

**Technical Details:**
- On successful login, query `users` table to get user record
- Extract `role` field from user record
- Store role in AuthContext state alongside user object
- RoleRoute component reads role from useAuth() hook

**Implementation Notes:**
- Modify `AuthContext` to query user record after auth
- Add `role` to AuthContext state: `{ user, session, loading, role, login, logout }`
- Query pattern: `supabase.from('users').select('role').eq('id', user.id).single()`
- Handle case where user record not found (should not happen, but fail-safe)

---

## Tasks & Implementation Steps

### Task 1: Add Role to AuthContext

**Acceptance Criteria:** AC5

**Subtasks:**

1. **Update auth types** (`src/features/auth/types.ts`)
   - [ ] Add `UserRole` type: `type UserRole = 'manager' | 'safety_officer' | 'plant_manager' | 'it_admin'`
   - [ ] Update `AuthContextValue` interface to include `role: UserRole | null`
   - [ ] Export new types

2. **Update AuthContext** (`src/features/auth/context/AuthContext.tsx`)
   - [ ] Add `role` to state: `const [role, setRole] = useState<UserRole | null>(null)`
   - [ ] Create `fetchUserRole()` function to query users table
   - [ ] Call `fetchUserRole()` after successful authentication
   - [ ] Set role state when user role is fetched
   - [ ] Clear role state on logout
   - [ ] Add role to context value: `{ user, session, loading, role, login, logout }`

3. **Update useAuth hook** (`src/features/auth/hooks/useAuth.ts`)
   - [ ] Ensure `role` is exposed from hook
   - [ ] TypeScript types updated to include role

**Testing:**
- [ ] Role is fetched and stored in AuthContext after login
- [ ] Role is null when not authenticated
- [ ] Role is cleared on logout

### Task 2: Create RoleRoute Component

**Acceptance Criteria:** AC2, AC3

**Subtasks:**

1. **Create RoleRoute component** (`src/routes/RoleRoute.tsx`)
   - [ ] Create component file with TypeScript
   - [ ] Define `RoleRouteProps` interface:
     - `children: ReactNode`
     - `allowedRoles: UserRole[]`
   - [ ] Use `useAuth()` hook to get current user role
   - [ ] Check if user role is in allowedRoles array
   - [ ] If role matches → render children
   - [ ] If role doesn't match → show access denied

2. **Create AccessDenied component** (`src/components/feedback/AccessDenied.tsx`)
   - [ ] Centered layout with icon (MUI LockIcon)
   - [ ] Hebrew title: "אין הרשאה"
   - [ ] Hebrew message: "אין לך הרשאה לגשת לעמוד זה"
   - [ ] Link/button to go back: "חזרה" or navigate to `/manage/incidents`
   - [ ] Mobile-first responsive design

3. **Add error message constant** (`src/lib/constants.ts`)
   - [ ] Add `ACCESS_DENIED` constant with Hebrew message
   - [ ] Export for use in RoleRoute and other components

**Testing:**
- [ ] RoleRoute blocks users without correct role
- [ ] RoleRoute allows users with correct role
- [ ] AccessDenied component displays Hebrew message
- [ ] Loading state shown while fetching role

### Task 3: Configure Routes with Role Restrictions

**Acceptance Criteria:** AC2, AC3, AC4

**Subtasks:**

1. **Update route configuration** (`src/routes/index.tsx`)
   - [ ] Import `RoleRoute` component
   - [ ] Wrap `/manage/users` route with `<RoleRoute allowedRoles={['it_admin']}>`
   - [ ] Keep `/manage/incidents` with `ProtectedRoute` only (no RoleRoute)
   - [ ] Keep `/manage/my-incidents` with `ProtectedRoute` only (no RoleRoute)
   - [ ] Ensure route structure is clear and maintainable

2. **Add future route placeholders** (Optional, for documentation)
   - [ ] Add comments indicating future role restrictions
   - [ ] Document which routes will need RoleRoute in Epic 2+

**Testing:**
- [ ] IT Admin can access /manage/users
- [ ] Manager cannot access /manage/users
- [ ] All authenticated users can access /manage/incidents
- [ ] All authenticated users can access /manage/my-incidents

### Task 4: Integration & End-to-End Testing

**Acceptance Criteria:** AC1, AC2, AC3, AC4, AC5

**Subtasks:**

1. **Test authentication redirect** (AC1)
   - [ ] Logout completely
   - [ ] Try to access `/manage/incidents` → redirected to `/login`
   - [ ] Try to access `/manage/users` → redirected to `/login`
   - [ ] Verify ProtectedRoute still works correctly

2. **Test Manager role restrictions** (AC2)
   - [ ] Login as Manager (create test user if needed)
   - [ ] Navigate to `/manage/incidents` → page loads
   - [ ] Navigate to `/manage/my-incidents` → page loads
   - [ ] Navigate to `/manage/users` → access denied message
   - [ ] Verify Hebrew error message displayed

3. **Test IT Admin role access** (AC3)
   - [ ] Login as IT Admin (create test user if needed)
   - [ ] Navigate to `/manage/users` → page loads successfully
   - [ ] Navigate to `/manage/incidents` → page loads
   - [ ] Verify no access denied messages

4. **Test role persistence** (AC5)
   - [ ] Login as Manager
   - [ ] Refresh page
   - [ ] Role still loaded (no access to /manage/users)
   - [ ] Login as IT Admin
   - [ ] Refresh page
   - [ ] Role still loaded (access to /manage/users)

5. **Test edge cases**
   - [ ] User with no role in database → fallback behavior
   - [ ] User with invalid role value → fallback behavior
   - [ ] Network error while fetching role → error handling
   - [ ] Direct URL navigation to restricted route

**Testing:**
- [ ] All acceptance criteria verified
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Production build successful

---

## Definition of Done

**Code Completeness:**
- [ ] `UserRole` type created in auth types
- [ ] `AuthContext` updated to fetch and store user role
- [ ] `useAuth` hook exposes role
- [ ] `RoleRoute` component created
- [ ] `AccessDenied` component created
- [ ] Routes configured with appropriate role restrictions
- [ ] All components use TypeScript with proper types
- [ ] Code follows project naming conventions

**Functionality:**
- [ ] User role fetched from database after login
- [ ] Role persists in AuthContext across navigation
- [ ] RoleRoute blocks users without correct role
- [ ] RoleRoute allows users with correct role
- [ ] AccessDenied shows Hebrew error message
- [ ] All authenticated users can access incident pages
- [ ] Only IT Admin can access user management

**Quality:**
- [ ] AccessDenied message in Hebrew
- [ ] Mobile-first responsive layout
- [ ] Touch targets 48px minimum
- [ ] RTL layout correct
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Production build successful

**Testing:**
- [ ] Manual testing: authentication redirect
- [ ] Manual testing: Manager role restrictions
- [ ] Manual testing: IT Admin role access
- [ ] Manual testing: role persistence on refresh
- [ ] Manual testing: edge cases (no role, invalid role)

**Documentation:**
- [ ] Code comments for role checking logic
- [ ] Component props documented with TypeScript types
- [ ] Route configuration commented
- [ ] Story updated with any implementation deviations
- [ ] Sprint status updated to mark story as done

**Requirements Coverage:**
- [ ] FR30 verified (role-based access to management features)
- [ ] NFR-S6 verified (users only access permitted functions)
- [ ] All 5 acceptance criteria verified

---

## Technical Requirements

### Required Dependencies

All dependencies already installed:
- `@supabase/supabase-js` (Supabase client)
- `react-router-dom` (React Router 7)
- `@mui/material` (MUI 7 components)
- `@mui/icons-material` (MUI icons for AccessDenied)
- `react` (React 19.2.0)

No new dependencies needed.

### Supabase Configuration

**Database Schema (Already Created in Story 1.2):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'manager',  -- 'manager', 'safety_officer', 'plant_manager', 'it_admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Required Test Users (Create in Supabase Dashboard):**
- Manager user: role = 'manager'
- IT Admin user: role = 'it_admin'
- (Optional) Safety Officer: role = 'safety_officer'
- (Optional) Plant Manager: role = 'plant_manager'

### Component APIs

**Supabase Queries:**
```typescript
// Fetch user role
const { data, error } = await supabase
  .from('users')
  .select('role')
  .eq('id', userId)
  .single()
```

**React Router 7:**
- `Navigate` - Component for redirect (used in ProtectedRoute pattern)
- `useNavigate()` - Programmatic navigation
- `useLocation()` - Current route location

**React Hooks:**
- `useState()` - Component state
- `useEffect()` - Side effects (fetch role on auth change)
- `useContext()` - Access AuthContext

**MUI Components:**
- `Box` - Layout container
- `Typography` - Text display
- `Button` - Navigation button
- `LockIcon` - Access denied icon

### File Structure

```
src/
├── features/
│   └── auth/
│       ├── context/
│       │   └── AuthContext.tsx (UPDATE: add role to state)
│       ├── hooks/
│       │   └── useAuth.ts (UPDATE: expose role)
│       └── types.ts (UPDATE: add UserRole type)
├── routes/
│   ├── index.tsx (UPDATE: add RoleRoute to user management)
│   └── RoleRoute.tsx (CREATE: new role guard component)
├── components/
│   └── feedback/
│       └── AccessDenied.tsx (CREATE: access denied message)
└── lib/
    └── constants.ts (UPDATE: add access denied message)
```

### Styling Approach

- Use MUI theme from Story 1.3
- Inline `sx` prop for component-specific styles
- RTL handled by theme
- Touch targets handled by theme (48px minimum)
- AccessDenied: centered layout, single column, icon + text + button

### Performance Considerations

- Role fetched once on login, stored in AuthContext
- No additional queries on navigation (role in memory)
- RoleRoute check is synchronous (role already loaded)
- Loading state only shown during initial auth check

---

## Testing Requirements

### Manual Testing Checklist

**Authentication Redirect (AC1):**
- [ ] Logout completely
- [ ] Navigate to `/manage/incidents` → redirected to `/login`
- [ ] Navigate to `/manage/users` → redirected to `/login`
- [ ] Login succeeds → redirected to original destination

**Manager Role Restrictions (AC2):**
- [ ] Login as Manager (test user)
- [ ] Navigate to `/manage/incidents` → page loads
- [ ] Navigate to `/manage/my-incidents` → page loads
- [ ] Try to access `/manage/users` directly → access denied
- [ ] Access denied message in Hebrew
- [ ] "Go back" button works

**IT Admin Access (AC3):**
- [ ] Login as IT Admin
- [ ] Navigate to `/manage/users` → page loads successfully
- [ ] Navigate to `/manage/incidents` → page loads
- [ ] No access denied messages shown

**All Users Incident Access (AC4):**
- [ ] Login as Manager → can access `/manage/incidents`
- [ ] Login as Safety Officer → can access `/manage/incidents`
- [ ] Login as IT Admin → can access `/manage/incidents`
- [ ] (Future: verify RLS filters data correctly)

**Role Persistence (AC5):**
- [ ] Login as Manager
- [ ] Verify role stored in AuthContext (check DevTools)
- [ ] Refresh page (F5)
- [ ] Role still present (no re-query needed)
- [ ] Access restrictions still enforced

**Edge Cases:**
- [ ] User with no role in database → default behavior
- [ ] User with role = null → fallback to lowest permission
- [ ] User with invalid role value → access denied to restricted routes
- [ ] Network error fetching role → error handling, Hebrew message
- [ ] Multiple tabs with same session → role consistent

**RTL & Mobile:**
- [ ] AccessDenied component renders RTL
- [ ] Hebrew text right-aligned
- [ ] Icon displays correctly
- [ ] Button minimum 48px height
- [ ] Layout responsive on mobile (375px width)

### Testing Notes

- Create test users in Supabase Dashboard → Authentication → Users
- Set user role in Supabase Dashboard → Database → users table
- Verify role in browser DevTools → Application → Local Storage → AuthContext
- Check Network tab for role query on login
- Test on multiple browsers (Chrome, Safari, Firefox)

---

## Dependencies & Risks

### Dependencies

**Upstream (Blocked By):**
- ✅ Story 1.1 (Project Initialization) - COMPLETED
- ✅ Story 1.2 (Supabase Project and Database Schema) - COMPLETED
- ✅ Story 1.3 (Hebrew RTL Theme Configuration) - COMPLETED
- ✅ Story 1.4 (App Shell with Bottom Navigation) - COMPLETED
- ✅ Story 1.5 (User Authentication - Login/Logout) - COMPLETED

**Downstream (Blocks):**
- Story 3.1+ (Incident Management - Safety Officer role check)
- Story 4.1+ (Incident Resolution - Manager role check)
- Story 5.1+ (User Management - IT Admin role check)

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User role not in database | Low | Medium | Fallback to default role or access denied |
| Role fetch fails on login | Low | High | Show error, prevent login until role loaded |
| Role mismatch between client and RLS | Low | Medium | RLS is authoritative; client for UX only |
| TypeScript type mismatches | Low | Low | Use strict typing for UserRole enum |

### Open Questions

✅ **RESOLVED:** Should we use JWT claims for roles?
**Answer:** No, store in `users.role` column for MVP simplicity. Can add JWT claims later if needed for other services.

✅ **RESOLVED:** What happens if user has no role?
**Answer:** Require role in database (NOT NULL DEFAULT 'manager'). If somehow missing, deny access to restricted routes.

✅ **RESOLVED:** Should we cache role or query every time?
**Answer:** Fetch once on login, store in AuthContext. Re-fetch on session restore (page refresh).

---

## Dev Notes

### Critical Implementation Details

**From Story 1.5 AuthContext:**
```typescript
// AuthContext already provides:
// - user: User | null
// - session: Session | null
// - loading: boolean
// - login(email, password): Promise<void>
// - logout(): Promise<void>

// Need to ADD:
// - role: UserRole | null
// - Fetch role after login
```

**Role Fetching Pattern:**
```typescript
const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }

  return data?.role as UserRole || null
}
```

**RoleRoute Component Pattern:**
```typescript
import { useAuth } from '@/features/auth'
import type { ReactNode } from 'react'
import type { UserRole } from '@/features/auth/types'
import { AccessDenied } from '@/components/feedback/AccessDenied'

interface RoleRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { role, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!role || !allowedRoles.includes(role)) {
    return <AccessDenied />
  }

  return <>{children}</>
}
```

### Architecture Requirements

**From architecture.md:**
- Feature-based folder structure
- TypeScript with strict typing
- Hebrew error messages
- RTL-aware components
- MUI theme tokens for styling

**From project-context.md:**
- Type-only imports: `import type { ... }`
- Use theme tokens: `theme.spacing()` not hard-coded values
- RTL-aware CSS: `paddingInline`, `marginInlineStart`
- PascalCase for components, camelCase for functions
- Feature code stays in feature folders

### Database Configuration (Already Done in Story 1.2)

**Users Table:**
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

**Valid Role Values:**
- `manager`
- `safety_officer`
- `plant_manager`
- `it_admin`

### Previous Story Patterns to Follow

**From Story 1.5:**
- AuthContext pattern with React Context API
- useAuth hook for accessing auth state
- Loading states during async operations
- Hebrew error messages via constants
- Type-only imports for React types

**From Story 1.4:**
- Route guard components using Navigate for redirect
- Loading spinner during state determination
- TypeScript interfaces for all props

### Testing Strategy

**Manual Testing Priority:**
1. Manager access restrictions (AC2)
2. IT Admin access to user management (AC3)
3. All users can access incidents (AC4)
4. Role persistence on refresh (AC5)
5. Authentication redirect still works (AC1)

**Edge Cases to Test:**
- User with no role in database
- User with invalid role value
- Network error during role fetch
- Multiple browser tabs with same session
- Direct URL navigation to restricted routes

### Error Message Constants

**Add to src/lib/constants.ts:**
```typescript
export const ERROR_MESSAGES = {
  // ... existing error messages
  ACCESS_DENIED: 'אין הרשאה לפעולה זו',
  NO_ROLE: 'לא נמצא תפקיד למשתמש',
  ROLE_FETCH_ERROR: 'שגיאה בטעינת הרשאות משתמש',
} as const
```

### Project Context Reference

**Location:** `_bmad-output/project-context.md`

**Critical Rules:**
- Hebrew (RTL) on ALL components
- Error messages: Hebrew only
- Database naming: snake_case (`users.role`)
- Code naming: PascalCase components (`RoleRoute`), camelCase functions (`fetchUserRole`)
- Type imports: `import type { UserRole }`

---

## Dev Agent Record

**Agent Model:** _To be filled by dev agent_
**Implementation Date:** _To be filled by dev agent_
**Actual Effort:** _To be filled by dev agent_

### Implementation Plan

This section will be filled by the dev agent with implementation approach, decisions, and notes.

### Completion Notes

This section will be filled by the dev agent upon story completion with:
- Summary of what was implemented
- Any deviations from the plan
- Key decisions made
- Validation results

### File List

This section will be filled by the dev agent with all files created/modified:
- Created: ...
- Modified: ...
- Deleted: (if any)

### Change Log

This section will be filled by the dev agent with a summary of changes made.

---

**Story Status:** ready-for-dev
**Last Updated:** 2026-01-01
