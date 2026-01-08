# Story 3.4: Incident Assignment Workflow

## Story Metadata

**Story ID:** 3-4-incident-assignment-workflow
**Epic:** Epic 3 - Incident Management (Safety Officer)
**Status:** review
**Priority:** High - Core triage workflow
**Sprint:** Sprint 3

**Dependencies:**
- Story 3.3 COMPLETED (Incident Detail View)
- Story 3.1 COMPLETED (Incident List View)
- Epic 1 COMPLETED (Auth + Database)

**Created:** 2026-01-05

---

## User Story

**As a** Safety Officer,
**I want** to assign an incident to a responsible manager,
**So that** someone takes ownership and resolves it.

---

## Acceptance Criteria

**AC1:** Detail page shows Assign button
- Given I am on detail page of "New" incident
- When I view the page
- Then I see "שיוך" (Assign) button

**AC2:** Assignment bottom sheet
- Given I tap Assign button
- When sheet opens
- Then I see list of managers to select

**AC3:** Successful assignment
- Given I select a manager
- When assignment completes
- Then status → "assigned"
- And assigned_to = selected user
- And assigned_at = current timestamp
- And success snackbar: "האירוע שויך בהצלחה"
- And sheet closes

**AC4:** Error handling
- Given assignment fails
- When network error occurs
- Then red error snackbar shows
- And incident remains unassigned

**AC5:** Reassignment support
- Given incident already assigned
- When I view detail
- Then I can reassign to different manager

---

## Definition of Done

- [x] Assign button on IncidentDetailPage
- [x] AssignmentSheet component (MUI SwipeableDrawer)
- [x] useUsers hook fetches managers
- [x] assignIncident API function
- [x] Success/error snackbars in Hebrew
- [x] Reassignment works
- [x] TypeScript compiles
- [x] FR14 verified

---

## Context from Previous Stories

**Story 3.3 provided:**
- IncidentDetailPage at `/manage/incidents/:id`
- useIncident(id) hook for fetching/refetching
- PhotoViewer component pattern (MUI Dialog)
- StatusChip showing status colors

**Reuse patterns:**
- Feature folder structure: `src/features/incidents/`
- Supabase API pattern with error handling
- Hebrew snackbars for feedback
- RTL layout (see project-context.md)

---

## Technical Specification

### New Components

**1. AssignmentSheet**
- MUI SwipeableDrawer (anchor="bottom")
- Props: open, onClose, incidentId, onAssigned
- Fetches managers with useUsers()
- Displays selectable manager cards
- Calls assignIncident() on selection

**2. useUsers Hook**
- Fetches users from Supabase
- Returns { users, isLoading, error }

### API Functions

**assignIncident(incidentId, userId)**
- Updates incidents table:
  - status = 'assigned'
  - assigned_to = userId
  - assigned_at = now()
- Returns updated incident

### Modified Components

**IncidentDetailPage**
- Add Assign button (visible for new/assigned status)
- Add AssignmentSheet component
- Refetch incident after assignment

---

## Tasks

### Task 1: Create User Types & API
- [x] Create `src/features/users/types.ts` with User interface
- [x] Create `src/features/users/api.ts` with getUsers()
- [x] Query users table, return array

### Task 2: Create useUsers Hook
- [x] Create `src/features/users/hooks/useUsers.ts`
- [x] Call getUsers() in useEffect
- [x] Return { users, isLoading, error }

### Task 3: Add Assignment API
- [x] Open `src/features/incidents/api.ts`
- [x] Add assignIncident(incidentId, userId) function
- [x] Update incidents table with status/assigned_to/assigned_at
- [x] Export function

### Task 4: Create AssignmentSheet
- [x] Create `src/features/incidents/components/AssignmentSheet.tsx`
- [x] Use MUI SwipeableDrawer
- [x] Use useUsers() to load managers
- [x] Map to selectable cards
- [x] Handle selection → assignIncident()
- [x] Show loading state
- [x] Hebrew labels

### Task 5: Add Button to Detail Page
- [x] Open `src/features/incidents/pages/IncidentDetailPage.tsx`
- [x] Add state: sheetOpen, setSheetOpen
- [x] Add button: "שיוך" (show for new/assigned)
- [x] Render AssignmentSheet
- [x] After assignment, refetch incident via useIncident
- [x] Show success/error snackbars

### Task 6: Test & Verify
- [x] TypeScript compilation passes
- [x] Build successful
- [x] All acceptance criteria met in code

---

## Developer Guardrails

### Reference Project Rules
- **RTL layout:** See project-context.md
- **Date format (DD/MM/YYYY):** See project-context.md
- **Hebrew errors:** See project-context.md
- **Database schema:** See architecture.md lines 642-691

### Story-Specific Patterns

**Assignment API Call:**
```typescript
export async function assignIncident(incidentId: string, userId: string) {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'assigned',
      assigned_to: userId,
      assigned_at: new Date().toISOString()
    })
    .eq('id', incidentId)
    .select()
    .single()

  if (error) throw new Error('שגיאה בשיוך האירוע')
  return data
}
```

**Bottom Sheet Pattern:**
```typescript
<SwipeableDrawer
  anchor="bottom"
  open={open}
  onClose={onClose}
  onOpen={() => {}}
  sx={{ '& .MuiDrawer-paper': { maxHeight: '70vh' } }}
>
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">בחר מנהל</Typography>
    {/* Manager list */}
  </Box>
</SwipeableDrawer>
```

**Manager Selection:**
```typescript
{users.map(user => (
  <Card
    key={user.id}
    onClick={() => handleSelect(user.id)}
    sx={{ mb: 1, cursor: 'pointer' }}
  >
    <CardContent>
      <Typography>{user.full_name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {user.email}
      </Typography>
    </CardContent>
  </Card>
))}
```

### Critical Mistakes to Avoid

❌ **DON'T:**
- Hide button on assigned incidents (blocks reassignment)
- Forget to refetch incident after assignment
- Leave assigned_at null
- Show button on resolved incidents

✅ **DO:**
- Show button for status 'new' OR 'assigned'
- Refetch incident to show updated status
- Set assigned_at to current timestamp
- Use Hebrew snackbars for feedback

---

## References

**Project Artifacts:**
- Epic: epics.md lines 838-876
- Architecture: architecture.md
- Project Context: project-context.md

**Code References:**
- IncidentDetailPage: safety-first/src/features/incidents/pages/IncidentDetailPage.tsx
- useIncident hook: safety-first/src/features/incidents/hooks/useIncident.ts
- Incident API: safety-first/src/features/incidents/api.ts

**Related Stories:**
- Story 3.3 (COMPLETED) - Provides detail page

**External Docs:**
- [MUI SwipeableDrawer](https://mui.com/material-ui/react-drawer/#swipeable)
- [Supabase Update](https://supabase.com/docs/reference/javascript/update)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Completed:** 2026-01-05

**Key Implementation Details:**
1. Created users feature with types, API, and custom hook for fetching manager list
2. Added assignIncident() API function to update incident status and assignment fields
3. Built AssignmentSheet component using MUI SwipeableDrawer with selectable manager cards
4. Enhanced useIncident hook with refetch capability for real-time status updates
5. Integrated Assign button into IncidentDetailPage (visible for 'new' and 'assigned' status)
6. Implemented success/error snackbars with Hebrew messages
7. Fixed TypeScript verbatimModuleSyntax import requirement for FC type

**Patterns Followed:**
- Hebrew error messages throughout
- RTL-compatible layout with MUI
- Feature-based folder organization
- Supabase API with error handling
- Loading and error states in all async operations
- Reassignment support (button visible for assigned incidents)

**Build Status:** ✅ Successful (tsc + vite build passed)

### File List

**Files Created:**
- `safety-first/src/features/users/types.ts` - User interface definition
- `safety-first/src/features/users/api.ts` - getUsers() API function
- `safety-first/src/features/users/hooks/useUsers.ts` - Custom hook for fetching users
- `safety-first/src/features/incidents/components/AssignmentSheet.tsx` - Bottom sheet UI component

**Files Modified:**
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Added Assign button, AssignmentSheet, and snackbar
- `safety-first/src/features/incidents/api.ts` - Added assignIncident() function
- `safety-first/src/features/incidents/hooks/useIncident.ts` - Added refetch capability

---

**🎯 Story 3.4 Ready for Development!**
