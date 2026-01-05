# Story 3.2: List Sorting and Filtering

## Story Metadata

**Story ID:** 3-2-list-sorting-and-filtering
**Epic:** Epic 3 - Incident Management (Safety Officer)
**Status:** review
**Priority:** High - Critical UX improvement for daily triage workflow
**Sprint:** Sprint 3

**Dependencies:**
- Story 3.1 COMPLETED (Incident List View)
- Epic 1 COMPLETED (Auth + RTL Theme)
- Epic 2 COMPLETED (Public reporting creates incidents)

**Blocks:**
- Story 3.3 (Detail view uses filtered/sorted list)

**Created:** 2026-01-05
**Last Updated:** 2026-01-05

---

## User Story

**As a** Safety Officer,
**I want** to sort and filter the incident list,
**So that** I can quickly find incidents that need my attention.

---

## Context

### Epic Context

**Epic 3: Incident Management (Safety Officer)**

Second story (2 of 6) in Safety Officer command center. Adds critical sorting and filtering controls to the incident list created in Story 3.1, enabling Safety Officer to focus on specific incident groups during triage.

**Key Design Principle:** Fast filtering for focused triage
- **Sort by date** - Newest first (default) or oldest first
- **Status filters** - All (default), New (pending), Assigned (in progress), Resolved (completed)
- **Visual feedback** - Active filter clearly highlighted
- **Hebrew labels** - All controls in Hebrew

### User Context

**Primary User:** Avi (Safety Officer)
- During morning triage, needs to focus on NEW incidents first
- Wants to see ASSIGNED incidents to check progress
- Sometimes needs to review RESOLVED incidents
- Prefers newest-first to see what just came in
- Occasionally checks oldest-first to ensure nothing is forgotten

**Design-For Scenario:**
- Avi logs in → navigates to incident list
- Taps "חדש" (New) filter → sees only 5 new incidents needing assignment
- Assigns 3 incidents quickly
- Taps "משוייך" (Assigned) filter → sees 7 incidents in progress
- Checks on ones assigned days ago (switches to oldest-first sort)
- Taps "הכל" (All) to return to full view

### Previous Story Intelligence

**Story 3.1 - Incident List View (COMPLETED):**

**Key Learnings:**
- ✅ `IncidentListPage` component exists at `safety-first/src/features/incidents/pages/IncidentListPage.tsx`
- ✅ `useIncidents()` hook fetches all incidents with `getIncidents()` API function
- ✅ Default sort is `created_at DESC` (newest first)
- ✅ `IncidentCard` component displays each incident with status chip and severity
- ✅ `StatusChip` component maps status to colors (Blue/Orange/Green)
- ✅ Empty state handled with `EmptyState` component
- ✅ Reload functionality via PageHeader button

**Files Created in 3.1:**
- `safety-first/src/features/incidents/pages/IncidentListPage.tsx`
- `safety-first/src/features/incidents/hooks/useIncidents.ts`
- `safety-first/src/features/incidents/components/IncidentCard.tsx`
- `safety-first/src/features/incidents/components/StatusChip.tsx`
- `safety-first/src/features/incidents/components/SeverityIndicator.tsx`
- `safety-first/src/features/incidents/components/EmptyState.tsx`
- `safety-first/src/features/incidents/api.ts` (contains `getIncidents()`)
- `safety-first/src/features/incidents/types.ts` (defines `Incident`, `IncidentStatus`, `IncidentSeverity`)

**Code Patterns Established:**
- Feature-based folder structure under `src/features/incidents/`
- React Context for auth (`AuthContext`)
- Supabase client queries with error handling
- Hebrew error messages in snackbars
- RTL layout with `marginInlineStart`/`marginInlineEnd`
- Date formatting with `date-fns` (DD/MM/YYYY)
- MUI components with RTL theme
- Touch-friendly 48px targets

**Integration Points:**
- Query `incidents` table via Supabase
- Status values: 'new', 'assigned', 'resolved'
- Default order: `created_at DESC`

---

## Requirements Analysis

### Functional Requirements

**FR11:** "Safety Officer can sort the incident list by date (newest/oldest)"
- Sort control with two options
- Default: newest first (already implemented in 3.1)
- Toggle to oldest first
- List re-sorts immediately

**FR13:** "Safety Officer can see the current status of each incident (new, assigned, resolved)"
- Already implemented in 3.1 via StatusChip
- This story adds STATUS FILTERING capability

**FR17:** "Safety Officer can view which incidents are pending assignment"
- Implemented via "New" status filter
- Shows only incidents with `status = 'new'`

**FR18:** "Safety Officer can view which incidents have been assigned but not resolved"
- Implemented via "Assigned" status filter
- Shows only incidents with `status = 'assigned'`

### Acceptance Criteria

**AC1: Sort control with newest/oldest options**
- **Given** I am viewing the incident list
- **When** I tap the sort control
- **Then** I can choose "חדש לישן" (newest first) or "ישן לחדש" (oldest first)
- **And** the default is newest first
- **And** the list re-sorts immediately
- **And** my selection persists while I navigate

**AC2: Status filter with All/New/Assigned/Resolved options**
- **Given** I am viewing the incident list
- **When** I tap a status filter (All, New, Assigned, Resolved)
- **Then** the list shows only incidents with that status
- **And** the active filter is visually highlighted
- **And** "All" is the default selection
- **And** my filter persists while I navigate

**AC3: "New" filter shows pending assignment (FR17)**
- **Given** I filter by "New" status
- **When** the filter applies
- **Then** I see only incidents pending assignment (status = 'new')
- **And** the incident count reflects filtered results

**AC4: "Assigned" filter shows assigned but not resolved (FR18)**
- **Given** I filter by "Assigned" status
- **When** the filter applies
- **Then** I see only incidents assigned but not resolved (status = 'assigned')
- **And** the incident count reflects filtered results

**AC5: Combined sort and filter work together**
- **Given** I have both a sort and filter selected
- **When** the list displays
- **Then** results are first filtered by status, then sorted by date
- **And** both controls show active state

**AC6: Empty state when filter yields no results**
- **Given** I apply a filter that matches no incidents
- **When** the list displays
- **Then** I see an empty state message: "אין דיווחים בסטטוס זה"
- **And** I can clear the filter easily

### Definition of Done

- [ ] Sort control (Toggle or Select) with newest/oldest options
- [ ] Default sort: newest first
- [ ] Filter chips or tabs (All, New, Assigned, Resolved)
- [ ] Default filter: All
- [ ] Active sort/filter visually indicated
- [ ] Filters can be applied via Supabase query OR client-side
- [ ] Combined sort + filter work correctly
- [ ] Empty state for no results
- [ ] Hebrew labels on all controls
- [ ] Sort/filter state persists during navigation
- [ ] FR11, FR13, FR17, FR18 verified
- [ ] TypeScript compilation passes
- [ ] All tests pass (no regressions)

---

## Technical Specification

### Implementation Approach

**Two Implementation Options:**

**Option 1: Server-Side Filtering (Recommended for MVP)**
- Modify `getIncidents()` to accept `sortOrder` and `statusFilter` parameters
- Pass parameters to Supabase `.order()` and `.eq()` methods
- Pros: More scalable, less data transferred
- Cons: More API calls on filter change

**Option 2: Client-Side Filtering**
- Fetch all incidents once
- Filter and sort in React component
- Pros: Instant filtering, no network calls
- Cons: Loads all data upfront (OK for ~50-100 incidents)

**Decision: Option 2 (Client-Side) for MVP**
- Incident count is small (~50-100 expected)
- Instant filtering improves UX
- Simpler implementation
- Can optimize to server-side later if needed

**Component Architecture:**
```
IncidentListPage
  ├── PageHeader (exists from 3.1)
  ├── SortControl (NEW - ToggleButtonGroup or Select)
  ├── FilterControl (NEW - Chip array or Tabs)
  ├── List container
  │   ├── IncidentCard (repeat for filtered/sorted incidents)
  │   └── EmptyState (when no results)
  └── Refresh button (exists from 3.1)
```

**Data Flow:**
1. `useIncidents()` fetches all incidents (as in 3.1)
2. Component maintains `sortOrder` and `statusFilter` state
3. `useMemo` computes filtered + sorted list
4. Render filtered/sorted incidents

### Files to Create/Modify

**New Files:**
1. `safety-first/src/features/incidents/components/SortControl.tsx` - Sort toggle/select
2. `safety-first/src/features/incidents/components/FilterControl.tsx` - Status filter chips/tabs

**Modified Files:**
1. `safety-first/src/features/incidents/pages/IncidentListPage.tsx` - Add sort/filter controls and logic
2. `safety-first/src/features/incidents/components/EmptyState.tsx` - Add variant for "no results" vs "no incidents"

---

## Tasks Breakdown

### Task 1: Create Sort Control Component
**AC:** Sort toggle with newest/oldest options (AC1)

**Subtasks:**
1. [x] Create `SortControl.tsx` component
2. [x] Use MUI ToggleButtonGroup OR Select component
3. [x] Define two options:
   - "חדש לישן" (newest first) - value: 'desc'
   - "ישן לחדש" (oldest first) - value: 'asc'
4. [x] Accept props: `value: 'asc' | 'desc'`, `onChange: (value) => void`
5. [x] Default value: 'desc' (newest first)
6. [x] RTL layout
7. [x] Touch-friendly (48px minimum)
8. [x] Export component

---

### Task 2: Create Filter Control Component
**AC:** Status filter with All/New/Assigned/Resolved (AC2)

**Subtasks:**
1. [x] Create `FilterControl.tsx` component
2. [x] Use MUI Chip array OR Tabs component
3. [x] Define four options with Hebrew labels:
   - "הכל" (All) - value: 'all'
   - "חדש" (New) - value: 'new'
   - "משוייך" (Assigned) - value: 'assigned'
   - "טופל" (Resolved) - value: 'resolved'
4. [x] Accept props: `value: string`, `onChange: (value) => void`
5. [x] Default value: 'all'
6. [x] Highlight active filter (color or variant change)
7. [x] RTL layout
8. [x] Touch-friendly
9. [x] Export component

---

### Task 3: Add Filtering Logic to IncidentListPage
**AC:** Filtered list displays correctly (AC2, AC3, AC4, AC5)

**Subtasks:**
1. [x] Open `IncidentListPage.tsx`
2. [x] Add state: `const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')`
3. [x] Add state: `const [statusFilter, setStatusFilter] = useState<string>('all')`
4. [x] Create `useMemo` to compute `filteredAndSortedIncidents`:
   ```typescript
   const filteredAndSortedIncidents = useMemo(() => {
     let result = incidents || []

     // Filter by status
     if (statusFilter !== 'all') {
       result = result.filter(inc => inc.status === statusFilter)
     }

     // Sort by date
     result = [...result].sort((a, b) => {
       const dateA = new Date(a.created_at).getTime()
       const dateB = new Date(b.created_at).getTime()
       return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
     })

     return result
   }, [incidents, statusFilter, sortOrder])
   ```
5. [x] Render `filteredAndSortedIncidents` instead of `incidents`
6. [x] Handle empty filtered results

---

### Task 4: Update Empty State Component
**AC:** Empty state shows appropriate message (AC6)

**Subtasks:**
1. [x] Open `EmptyState.tsx`
2. [x] Add optional `variant` prop: `'no-incidents' | 'no-results'`
3. [x] Change message based on variant:
   - 'no-incidents': "אין דיווחים במערכת"
   - 'no-results': "אין דיווחים בסטטוס זה"
4. [x] Default variant: 'no-incidents'
5. [x] Export updated component

---

### Task 5: Integrate Controls into IncidentListPage
**AC:** Sort and filter controls display and work (AC1, AC2, AC5)

**Subtasks:**
1. [x] Import `SortControl` and `FilterControl`
2. [x] Add controls to page layout (below PageHeader, above list)
3. [x] Wire up `sortOrder` state to `SortControl`
4. [x] Wire up `statusFilter` state to `FilterControl`
5. [x] Pass `onChange` handlers
6. [x] Test combined sort + filter
7. [x] Verify RTL layout
8. [x] Ensure touch-friendly spacing

---

### Task 6: Update Empty State Logic
**AC:** Correct empty state shows based on context (AC6)

**Subtasks:**
1. [x] In `IncidentListPage`, check two conditions:
   - No incidents at all: `incidents.length === 0`
   - No results from filter: `filteredAndSortedIncidents.length === 0 && incidents.length > 0`
2. [x] Show `EmptyState` with variant='no-incidents' if no incidents
3. [x] Show `EmptyState` with variant='no-results' if filter yields nothing
4. [x] Add "Clear Filter" option or visual cue

---

### Task 7: Testing and Verification
**AC:** All acceptance criteria pass

**Subtasks:**
1. [x] TypeScript compilation passes
2. [x] All tests pass (no regressions)
3. [x] Sort control works (newest/oldest)
4. [x] Filter control works (All/New/Assigned/Resolved)
5. [x] Combined sort + filter work correctly
6. [x] Empty state shows appropriate message
7. [x] Hebrew labels throughout
8. [x] RTL layout correct
9. [x] Touch-friendly (48px targets)
10. [x] FR11, FR17, FR18 verified

---

## Developer Context & Guardrails

### 🔥 CRITICAL: Avoid These Common Mistakes

**1. Breaking Previous Story's Work**
- ✅ DO: Keep all Story 3.1 functionality intact
- ✅ DO: Test that basic list still loads without filters
- ❌ DON'T: Break existing `useIncidents` hook
- ❌ DON'T: Modify StatusChip or SeverityIndicator components

**2. Client-Side vs Server-Side Confusion**
- ✅ DO: Use client-side filtering (fetch all, filter in React)
- ✅ DO: Use `useMemo` for performance
- ❌ DON'T: Modify `getIncidents()` API function (not needed for MVP)
- ❌ DON'T: Add server-side query parameters (can optimize later)

**3. RTL Layout Issues**
- ✅ DO: Use `marginInlineStart` / `marginInlineEnd`
- ✅ DO: Test with Hebrew text in controls
- ❌ DON'T: Use `marginLeft` / `marginRight`
- ❌ DON'T: Hardcode LTR assumptions

**4. Filter State Management**
- ✅ DO: Use React `useState` for filter/sort state
- ✅ DO: Use `useMemo` to compute filtered list
- ✅ DO: Keep state local to `IncidentListPage` (no global state needed)
- ❌ DON'T: Store in Context (unnecessary complexity)
- ❌ DON'T: Persist to localStorage (not required for MVP)

**5. Component Choice**
- ✅ DO: Use MUI ToggleButtonGroup OR Select for sort
- ✅ DO: Use MUI Chip array OR Tabs for filter
- ✅ DO: Choose based on mobile UX (Chips are more touch-friendly)
- ❌ DON'T: Build custom dropdown (use MUI components)

---

### Critical Implementation Rules

**1. Hebrew Labels (NEVER FORGET)**
```typescript
// Sort options
const SORT_OPTIONS = {
  desc: 'חדש לישן',  // Newest first
  asc: 'ישן לחדש',   // Oldest first
}

// Filter options
const FILTER_OPTIONS = {
  all: 'הכל',        // All
  new: 'חדש',        // New
  assigned: 'משוייך',  // Assigned
  resolved: 'טופל',    // Resolved
}
```

**2. Client-Side Filtering Pattern**
```typescript
// In IncidentListPage.tsx
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [statusFilter, setStatusFilter] = useState<string>('all')

const filteredAndSortedIncidents = useMemo(() => {
  let result = incidents || []

  // Apply status filter
  if (statusFilter !== 'all') {
    result = result.filter(inc => inc.status === statusFilter)
  }

  // Apply sort
  result = [...result].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  return result
}, [incidents, statusFilter, sortOrder])
```

**3. MUI Component Patterns**

**Option A: ToggleButtonGroup for Sort**
```typescript
import { ToggleButtonGroup, ToggleButton } from '@mui/material'

<ToggleButtonGroup
  value={sortOrder}
  exclusive
  onChange={(_, value) => value && setSortOrder(value)}
  size="small"
>
  <ToggleButton value="desc">חדש לישן</ToggleButton>
  <ToggleButton value="asc">ישן לחדש</ToggleButton>
</ToggleButtonGroup>
```

**Option B: Chips for Filter**
```typescript
import { Chip, Stack } from '@mui/material'

<Stack direction="row" spacing={1}>
  {['all', 'new', 'assigned', 'resolved'].map(status => (
    <Chip
      key={status}
      label={FILTER_OPTIONS[status]}
      onClick={() => setStatusFilter(status)}
      color={statusFilter === status ? 'primary' : 'default'}
      variant={statusFilter === status ? 'filled' : 'outlined'}
    />
  ))}
</Stack>
```

**4. Empty State Variants**
```typescript
// In EmptyState.tsx
interface EmptyStateProps {
  variant?: 'no-incidents' | 'no-results'
}

const MESSAGES = {
  'no-incidents': 'אין דיווחים במערכת',
  'no-results': 'אין דיווחים בסטטוס זה',
}

export const EmptyState: FC<EmptyStateProps> = ({ variant = 'no-incidents' }) => {
  return (
    <Box>
      <InboxIcon />
      <Typography>{MESSAGES[variant]}</Typography>
    </Box>
  )
}
```

**5. Touch-Friendly Sizing**
```typescript
// All interactive controls must have 48px minimum target
sx={{
  minHeight: 48,
  minWidth: 48,
  // Use padding to increase touch area
  padding: 2,
}}
```

---

### Architecture Compliance

**Technology Stack:**
- React 19.x ✅
- TypeScript 5.x ✅
- MUI 7.x ✅
- Supabase JS 2.x ✅ (no changes needed)
- React Router 7.x ✅ (no routing changes)

**Code Organization:**
```
safety-first/src/features/incidents/
  ├── pages/
  │   └── IncidentListPage.tsx       (MODIFY - add sort/filter)
  ├── components/
  │   ├── IncidentCard.tsx           (no change)
  │   ├── StatusChip.tsx             (no change)
  │   ├── SeverityIndicator.tsx      (no change)
  │   ├── EmptyState.tsx             (MODIFY - add variant)
  │   ├── SortControl.tsx            (NEW)
  │   └── FilterControl.tsx          (NEW)
  ├── hooks/
  │   └── useIncidents.ts            (no change)
  ├── api.ts                         (no change)
  └── types.ts                       (no change)
```

**Naming Conventions:**
- Components: PascalCase (`SortControl`, `FilterControl`)
- Files: Match component name
- Functions: camelCase (`filteredAndSortedIncidents`)
- Constants: UPPER_SNAKE (`SORT_OPTIONS`, `FILTER_OPTIONS`)

**State Management:**
- Local component state (`useState`) ✅
- No need for Context or global state ✅
- `useMemo` for computed derived state ✅

---

### Database Schema Reference

**No database changes required** - this story uses existing schema from Story 3.1:

```sql
-- incidents table (from Epic 1.2)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name TEXT,                    -- Optional, NULL for anonymous
  severity TEXT NOT NULL,                -- unknown, near-miss, minor, major, critical
  location_id UUID REFERENCES plant_locations(id),
  incident_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  photo_url TEXT,                        -- Supabase Storage URL
  status TEXT NOT NULL DEFAULT 'new',    -- new, assigned, resolved  ← FILTER ON THIS
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),  ← SORT ON THIS
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Relevant Columns:**
- `status` - Filter field ('new', 'assigned', 'resolved')
- `created_at` - Sort field (newest/oldest)

---

### Latest Technical Information (Web Research)

**MUI 7 Component Recommendations:**

Based on latest MUI documentation research (2025), the recommended components for this story:

**For Sorting:**
- **ToggleButtonGroup** - Best for binary/ternary choices (newest/oldest)
- Touch-friendly, visually clear active state
- Docs: [MUI ToggleButton](https://mui.com/material-ui/react-toggle-button/)

**For Filtering:**
- **Chip Array** - Material Design "Filter Chips" pattern
- Tags used to filter content (shopping categories, status filters)
- Touch-friendly, visual active state via color/variant
- Docs: [MUI Chip](https://mui.com/material-ui/react-chip/)

**Alternative:** MUI Tabs - also valid for status filtering, but Chips are more compact

**Supabase Query Best Practices (2025):**

While this story uses client-side filtering, for future optimization:
- Use `.order('created_at', { ascending: false })` for server-side sort
- Use `.eq('status', 'new')` for server-side filter
- Can chain: `.select().eq('status', 'new').order('created_at', { ascending: false })`
- Docs: [Supabase Order](https://supabase.com/docs/reference/javascript/order), [Supabase Filters](https://supabase.com/docs/reference/javascript/using-filters)

**React Best Practices:**
- Use `useMemo` for expensive computations (filtering/sorting arrays)
- Avoids re-computing on every render
- Dependencies: `[incidents, statusFilter, sortOrder]`

**Sources:**
- [React Chip component - Material UI](https://mui.com/material-ui/react-chip/)
- [JavaScript: Order the results | Supabase Docs](https://supabase.com/docs/reference/javascript/order)
- [JavaScript API Reference | Supabase Docs](https://supabase.com/docs/reference/javascript/using-filters)

---

### Common Mistakes to Avoid

**❌ DON'T:**
- Modify `getIncidents()` API (not needed for client-side filtering)
- Break Story 3.1 functionality
- Use `marginLeft`/`marginRight` (breaks RTL)
- Forget Hebrew labels
- Skip `useMemo` (performance issue)
- Make controls too small (<48px)
- Persist filter state (not required for MVP)

**✅ DO:**
- Keep all Story 3.1 code working
- Use client-side filtering with `useMemo`
- Use `marginInlineStart`/`marginInlineEnd`
- All labels in Hebrew
- Touch-friendly controls (48px minimum)
- Test combined sort + filter
- Handle empty filter results gracefully

---

## Testing Strategy

### Manual Testing Checklist

**Login & Navigation:**
1. [ ] Login as Safety Officer
2. [ ] Navigate to incident list
3. [ ] Verify Story 3.1 functionality still works (basic list)

**Sort Control:**
4. [ ] Verify default sort is "חדש לישן" (newest first)
5. [ ] Tap "ישן לחדש" (oldest first)
6. [ ] Verify list re-sorts with oldest incidents at top
7. [ ] Toggle back to newest first
8. [ ] Verify list re-sorts correctly

**Filter Control:**
9. [ ] Verify default filter is "הכל" (All)
10. [ ] Tap "חדש" (New) filter
11. [ ] Verify only new incidents show
12. [ ] Verify active chip is highlighted
13. [ ] Tap "משוייך" (Assigned) filter
14. [ ] Verify only assigned incidents show
15. [ ] Tap "טופל" (Resolved) filter
16. [ ] Verify only resolved incidents show
17. [ ] Tap "הכל" (All) filter
18. [ ] Verify all incidents show again

**Combined Sort + Filter:**
19. [ ] Select "חדש" (New) filter + "ישן לחדש" (oldest) sort
20. [ ] Verify only new incidents, sorted oldest first
21. [ ] Change to newest first
22. [ ] Verify same incidents, sorted newest first

**Empty State:**
23. [ ] Select a filter with no matching incidents (e.g., if no resolved incidents)
24. [ ] Verify empty state shows: "אין דיווחים בסטטוס זה"
25. [ ] Switch back to "הכל" (All)
26. [ ] Verify incidents appear again

**RTL & Touch:**
27. [ ] Verify all text in Hebrew
28. [ ] Verify RTL layout (controls align right)
29. [ ] Verify touch targets are 48px+ (easy to tap)
30. [ ] Test on mobile viewport (or DevTools mobile mode)

**Performance:**
31. [ ] Verify filtering is instant (no lag)
32. [ ] Verify sorting is instant (no lag)
33. [ ] Check console for errors

**Regression Testing:**
34. [ ] Verify refresh button still works
35. [ ] Verify empty state (no incidents) still works
36. [ ] Verify status chips still display correctly
37. [ ] Verify severity indicators still work
38. [ ] TypeScript compilation passes
39. [ ] All tests pass

---

## References

### Project Artifacts

- **Epic:** `_bmad-output/epics.md` (lines 760-797) - Story 3.2 definition
- **Architecture:** `_bmad-output/architecture.md` - Tech stack, code organization
- **Project Context:** `_bmad-output/project-context.md` - Critical rules (RTL, dates, naming)
- **UX Spec:** `_bmad-output/ux-design-specification.md` - Design patterns, touch targets

### Code References (from Story 3.1)

- **Incident List Page:** `safety-first/src/features/incidents/pages/IncidentListPage.tsx:1` - Main page to modify
- **useIncidents Hook:** `safety-first/src/features/incidents/hooks/useIncidents.ts:1` - Data fetching (no change)
- **IncidentCard:** `safety-first/src/features/incidents/components/IncidentCard.tsx:1` - Card display (no change)
- **StatusChip:** `safety-first/src/features/incidents/components/StatusChip.tsx:1` - Status colors (no change)
- **EmptyState:** `safety-first/src/features/incidents/components/EmptyState.tsx:1` - To modify for variants
- **API Functions:** `safety-first/src/features/incidents/api.ts:1` - getIncidents() (no change)
- **Types:** `safety-first/src/features/incidents/types.ts:1` - Incident, IncidentStatus types

### Related Stories

- **Story 3.1:** Incident List View (COMPLETED) - Foundation for this story
- **Story 3.3:** Incident Detail View (NEXT) - Will navigate from filtered list
- **Story 3.4:** Incident Assignment Workflow (LATER) - Will use filtered list

### External Documentation

- [MUI Chip Documentation](https://mui.com/material-ui/react-chip/)
- [MUI ToggleButton Documentation](https://mui.com/material-ui/react-toggle-button/)
- [React useMemo Hook](https://react.dev/reference/react/useMemo)
- [Supabase Order Documentation](https://supabase.com/docs/reference/javascript/order)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

_To be filled during implementation_

### Completion Notes List

✅ **Implemented Story 3.2: List Sorting and Filtering** (2026-01-05)

**Implementation Summary:**
- Created `SortControl` component using MUI ToggleButtonGroup
- Created `FilterControl` component using MUI Chip array
- Updated `EmptyState` to support `variant` prop (no-incidents/no-results)
- Enhanced `IncidentListPage` with client-side filtering/sorting logic
- All Hebrew labels, RTL layout, 48px touch targets

**Technical Approach:**
- Client-side filtering with `useMemo` for performance
- Filter by status: all/new/assigned/resolved
- Sort by created_at: newest/oldest (default: newest)
- Two empty states: no incidents vs no filter results

**TypeScript:** ✅ Compiles cleanly
**Tests:** ✅ No regressions (Epic 2 failures pre-existing)

### File List

**Files Created:**
- `safety-first/src/features/incidents/components/SortControl.tsx`
- `safety-first/src/features/incidents/components/FilterControl.tsx`

**Files Modified:**
- `safety-first/src/features/incidents/pages/IncidentListPage.tsx`
- `safety-first/src/features/incidents/components/EmptyState.tsx`

---

**🎯 Story 3.2 Ready for Development!**

This story adds critical sorting and filtering capabilities to the incident list, enabling Safety Officers to focus their triage efforts efficiently. The comprehensive context above provides everything needed for flawless implementation.

