# Story 4.4: Assignee Visibility and Filtering

Status: done

## Story

**As a** Safety Officer or Manager,
**I want** to see who incidents are assigned to in the list view and filter by assignee,
**So that** I can quickly find incidents assigned to specific managers.

## Acceptance Criteria

**AC1:** Assignee name displayed on incident cards
- Given I am viewing the incident list
- When I look at an incident card
- Then I see the assignee name displayed (if assigned)
- And unassigned incidents show "לא משויך" (Not assigned)

**AC2:** Assignee filter dropdown
- Given I am viewing the incident list
- When I tap the assignee filter ("שיוך")
- Then I see a dropdown with all manager names
- And I see an "הכל" (All) option
- And I can select a specific manager

**AC3:** Filter by specific assignee
- Given I select a specific manager in the assignee filter
- When the filter is applied
- Then the list shows only incidents assigned to that manager
- And the selected manager name is highlighted in the filter

**AC4:** Filter shows all assignments
- Given I select "הכל" (All) in the assignee filter
- When the filter is applied
- Then the list shows all incidents regardless of assignment

## Definition of Done

- [x] Assignee name displayed on incident cards in list view
- [x] "לא משויך" shown for unassigned incidents
- [x] Assignee filter dropdown added to IncidentListPage
- [x] Filter populated with all manager names from users table
- [x] Filter includes "הכל" (All) option as default
- [x] List filters correctly by selected assignee
- [x] Filter state persists during session
- [x] Hebrew labels throughout
- [x] Build passes with no TypeScript errors

---

## Context from Previous Stories

**Story 3.1 (COMPLETED) provided:**
- IncidentListPage at `safety-first/src/features/incidents/pages/IncidentListPage.tsx`
- IncidentCard component at `safety-first/src/features/incidents/components/IncidentCard.tsx`
- FilterControl component for status filtering
- SortControl component for date sorting
- Client-side filtering pattern using useMemo

**Story 3.4 (COMPLETED) provided:**
- AssignmentSheet component with user dropdown pattern
- assignIncident() API that sets assigned_to and assigned_by fields
- Users fetching pattern from users table

**Story 4.1 (COMPLETED) provided:**
- getIncidentById() already joins assigned_user via `users!incidents_assigned_to_fkey`
- Assignee information already available in incident detail view

**Key Pattern from Story 4.3:**
- Scroll position preservation in IncidentListPage (lines 12, 25, 54-75)
- Filter state management with useMemo (lines 28-44)

**This story ENHANCES existing components:**
- IncidentCard: Add assignee display
- IncidentListPage: Add assignee filter control
- getIncidents() API: Add user join for assignee names
- types.ts: Assignee data already defined (lines 33-37)

---

## Technical Specification

### Database Schema (Reference)

See architecture.md lines 642-691. This story uses existing schema:

**incidents table** (relevant columns):
- `assigned_to` (UUID, nullable, FK to users.id) - Already exists
- `assigned_by` (UUID, nullable, FK to users.id) - Already exists

**users table** (for manager names):
- Used to populate filter dropdown and display names

### API Enhancement

**getIncidents() - Add assignee join:**

Current implementation (api.ts lines 22-34):
```typescript
export async function getIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })
  // ...
}
```

Enhanced implementation:
```typescript
export async function getIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      assigned_user:users!incidents_assigned_to_fkey (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
  // ...
}
```

**Note:** This matches the pattern already used in getIncidentById() (api.ts lines 40-73).

**New API function - Get all managers:**

```typescript
/**
 * Fetch all manager users for assignee filter
 * Used to populate assignee filter dropdown
 */
export async function getManagers(): Promise<Array<{ id: string; full_name: string }>> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Failed to fetch managers:', error)
    throw new Error('שגיאה בטעינת רשימת מנהלים')
  }

  return data || []
}
```

### Component Enhancements

**IncidentCard.tsx - Add assignee display:**

Add assignee section below status chip (after line 87):

```typescript
{/* Assignee info */}
<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
  <Typography variant="caption" color="text.secondary">
    משויך ל:
  </Typography>
  <Typography variant="caption" fontWeight={500}>
    {incident.assigned_user?.full_name || 'לא משויך'}
  </Typography>
</Box>
```

**New Component - AssigneeFilter.tsx:**

Create new filter component similar to FilterControl pattern:

```typescript
import { Select, MenuItem, FormControl } from '@mui/material'

interface AssigneeFilterProps {
  value: string  // 'all' or user ID
  onChange: (value: string) => void
  managers: Array<{ id: string; full_name: string }>
}

export function AssigneeFilter({ value, onChange, managers }: AssigneeFilterProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
      >
        <MenuItem value="all">הכל</MenuItem>
        {managers.map((manager) => (
          <MenuItem key={manager.id} value={manager.id}>
            {manager.full_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
```

**IncidentListPage.tsx - Add assignee filter:**

Changes needed:
1. Import getManagers from api.ts
2. Add managers state and fetch on mount
3. Add assigneeFilter state (default: 'all')
4. Update filteredAndSortedIncidents to include assignee filtering
5. Add AssigneeFilter component to UI (alongside existing filters)

Filter logic addition to useMemo (after line 33):
```typescript
// Filter by assignee (add after status filter)
if (assigneeFilter !== 'all') {
  result = result.filter((inc) => inc.assigned_to === assigneeFilter)
}
```

UI addition (after existing FilterControl around line 140):
```typescript
{/* Assignee Filter with Label */}
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="body2" sx={{ fontWeight: 500 }}>
    שיוך:
  </Typography>
  <AssigneeFilter
    value={assigneeFilter}
    onChange={setAssigneeFilter}
    managers={managers || []}
  />
</Box>
```

---

## Tasks

### Task 1: Enhance getIncidents API to include assignee join (AC1)
- [x] Open `src/features/incidents/api.ts`
- [x] Add user join to getIncidents() select query
- [x] Use same pattern as getIncidentById() (lines 43-58)
- [x] Test that assigned_user data is returned

### Task 2: Add getManagers API function (AC2)
- [x] Open `src/features/incidents/api.ts`
- [x] Add getManagers() function to fetch all users
- [x] Order by full_name ascending
- [x] Return id and full_name only
- [x] Export function

### Task 3: Display assignee on IncidentCard (AC1)
- [x] Open `src/features/incidents/components/IncidentCard.tsx`
- [x] Add assignee display after status chip (line 87)
- [x] Show assigned_user.full_name if exists
- [x] Show "לא משויך" if assigned_to is null
- [x] Use Typography variant="caption"

### Task 4: Create AssigneeFilter component (AC2)
- [x] Create `src/features/incidents/components/AssigneeFilter.tsx`
- [x] Implement Select dropdown with managers list
- [x] Add "הכל" as first option (value: 'all')
- [x] Map managers to MenuItems by full_name
- [x] Follow FilterComponent pattern
- [x] Export component

### Task 5: Add assignee filter to IncidentListPage (AC2, AC3, AC4)
- [x] Open `src/features/incidents/pages/IncidentListPage.tsx`
- [x] Import getManagers from api.ts
- [x] Add managers state and useEffect to fetch on mount
- [x] Add assigneeFilter state (default: 'all')
- [x] Update useMemo to filter by assignee when not 'all'
- [x] Add AssigneeFilter component to UI (alongside status filter)
- [x] Add label "שיוך:" before filter

### Task 6: Build and verify
- [x] TypeScript compilation passes (npm run build)
- [x] All acceptance criteria verified
- [x] Test assignee display on cards
- [x] Test filter dropdown shows all managers
- [x] Test filtering by specific assignee
- [x] Test "הכל" shows all incidents

---

## Developer Guardrails

### Reference Project Rules
- **RTL layout, Hebrew labels, date formats:** See project-context.md
- **Database schema:** See architecture.md lines 642-691
- **Component patterns:** See existing FilterControl, SortControl components
- **API patterns:** See getIncidentById() for join pattern (api.ts lines 40-73)

### Story-Specific Patterns

**User Join Pattern (from getIncidentById):**
```typescript
assigned_user:users!incidents_assigned_to_fkey (
  id,
  full_name,
  email
)
```

**Filter State Management Pattern:**
```typescript
const [assigneeFilter, setAssigneeFilter] = useState<string>('all')

// In useMemo
if (assigneeFilter !== 'all') {
  result = result.filter((inc) => inc.assigned_to === assigneeFilter)
}
```

**Optional Display Pattern:**
```typescript
{incident.assigned_user?.full_name || 'לא משויך'}
```

### Critical Mistakes to Avoid

❌ **DON'T:**
- Modify incidents table schema (assignee fields already exist)
- Create new API endpoint (enhance existing getIncidents)
- Forget to join assigned_user in getIncidents()
- Use English labels in filter
- Break existing filters (status, sort)
- Lose scroll position preservation

✅ **DO:**
- Reuse assigned_user join pattern from getIncidentById
- Add assignee filter alongside existing status filter
- Keep all existing filters working (status, sort, scroll)
- Use "לא משויך" for unassigned incidents
- Follow existing filter component patterns
- Test that filter persists during navigation

### Token Efficiency Notes

**This story references (not repeats):**
- RTL/Hebrew rules → project-context.md
- Database schema → architecture.md lines 642-691
- User join pattern → getIncidentById() in api.ts lines 40-73
- Filter pattern → FilterControl component
- Scroll preservation → IncidentListPage lines 12-75

**This story adds (new/unique):**
- Assignee display on IncidentCard
- AssigneeFilter component
- getManagers() API function
- Assignee filtering in list view
- "לא משויך" label for unassigned

---

## References

**Project Artifacts:**
- Epic 4: epics.md lines 999-1042
- Architecture: architecture.md
- Project Context: project-context.md

**Code References:**
- IncidentListPage: safety-first/src/features/incidents/pages/IncidentListPage.tsx
- IncidentCard: safety-first/src/features/incidents/components/IncidentCard.tsx
- Incidents API: safety-first/src/features/incidents/api.ts (see getIncidentById for join pattern)
- Incident Types: safety-first/src/features/incidents/types.ts (assigned_user already defined lines 33-37)
- FilterControl: safety-first/src/features/incidents/components/FilterControl.tsx (pattern to follow)

**Related Stories:**
- Story 3.1 (COMPLETED) - Created IncidentListPage and IncidentCard
- Story 3.4 (COMPLETED) - Created assignment workflow with user selection
- Story 4.1 (COMPLETED) - Added assignee display in detail view
- Story 4.3 (COMPLETED) - Enhanced detail view with scroll preservation pattern

**External Docs:**
- [MUI Select](https://mui.com/material-ui/react-select/)
- [Supabase Joins](https://supabase.com/docs/reference/javascript/select#query-foreign-tables)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

**Implementation Summary:**

All acceptance criteria successfully implemented:

**AC1 - Assignee Display:** Added assignee information to IncidentCard component showing assigned user's full name or "לא משויך" for unassigned incidents using Typography caption variant.

**AC2 - Assignee Filter Dropdown:** Created new AssigneeFilter component following the FilterControl pattern with MUI Select component. Filter includes "הכל" option and populates with all manager names from users table.

**AC3 & AC4 - Filter Functionality:** Implemented assignee filtering logic in IncidentListPage using useMemo pattern. Filter correctly shows incidents for selected assignee or all incidents when "הכל" is selected.

**API Enhancements:**
- Enhanced `getIncidents()` to include assigned_user join using the same pattern as `getIncidentById()`
- Added `getManagers()` function to fetch all users sorted by full_name

**Key Implementation Details:**
- Managers fetched on component mount via useEffect
- Filter state managed with useState (default: 'all')
- Client-side filtering applied in useMemo alongside existing status and sort filters
- All Hebrew labels used ("שיוך:", "הכל", "לא משויך")
- Build passed with zero TypeScript errors

**Testing Verification:**
- TypeScript compilation successful (npm run build)
- All DoD criteria met
- Follows existing patterns from FilterControl and SortControl
- Maintains scroll position preservation from Story 4.3

**Post-Implementation Improvements:**
- Updated `getManagers()` to filter by role='manager' (excludes it_admin users)
- Redesigned IncidentCard layout with separate implementations for desktop and mobile:

  **Desktop Layout (lg breakpoint and up - large screens):**
  - CSS Grid with 5 equal columns (1fr each) and 2 rows
  - Row 1 fields (RTL - right to left):
    - Status: Column 1 (aligned right)
    - Date: Column 2
    - Severity: Column 3
    - Assigned to: Column 4
    - Photo icon: Column 5 (aligned left)
  - Row 2: Description (if exists, spans all columns, aligned right)
  - Uses fractional units (1fr) instead of percentages to properly account for grid gaps
  - Photo icon now correctly visible within card boundaries
  - Perfect vertical alignment across all cards
  - Consistent layout regardless of description presence

  **Mobile/Tablet Layout (xs to md breakpoints - small/medium screens):**
  - Flexbox-based 3-line layout:
    - Line 1: Date (aligned right)
    - Line 2: Status | Severity | Assigned to | Photo icon (horizontal with gap: 1.5, flexWrap for responsiveness)
    - Line 3: Description (if exists, aligned right)
  - Fields properly spaced horizontally with no overlap
  - Clean visual hierarchy optimized for narrow screens

- Photo indicator simplified to camera icon (removed chip/label for space efficiency)
- Reduced padding from 2 to 1.5 for more compact cards
- Removed unused Chip import after photo indicator simplification
- Separate rendering logic for desktop (grid) and mobile (flex) using MUI responsive display utilities

### File List

**Files Modified:**
- `safety-first/src/features/incidents/api.ts` - Enhanced getIncidents() with assigned_user join, added getManagers() function
- `safety-first/src/features/incidents/components/IncidentCard.tsx` - Added assignee display with Hebrew labels
- `safety-first/src/features/incidents/pages/IncidentListPage.tsx` - Imported getManagers, added state management, filter logic, and AssigneeFilter UI component

**Files Created:**
- `safety-first/src/features/incidents/components/AssigneeFilter.tsx` - New assignee filter dropdown component
