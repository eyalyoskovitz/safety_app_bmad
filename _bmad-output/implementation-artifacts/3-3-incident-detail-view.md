# Story 3.3: Incident Detail View

## Story Metadata

**Story ID:** 3-3-incident-detail-view
**Epic:** Epic 3 - Incident Management (Safety Officer)
**Status:** ready-for-dev
**Priority:** High - Critical for understanding incidents before assignment
**Sprint:** Sprint 3

**Dependencies:**
- Story 3.1 COMPLETED (Incident List View)
- Story 3.2 REVIEW (List Sorting and Filtering)
- Epic 1 COMPLETED (Auth + RTL Theme)
- Epic 2 COMPLETED (Public reporting creates incidents)

**Blocks:**
- Story 3.4 (Assignment workflow navigates from detail)

**Created:** 2026-01-05
**Last Updated:** 2026-01-05

---

## User Story

**As a** Safety Officer,
**I want** to view full details of an incident including the photo,
**So that** I can understand the issue before assigning it.

---

## Context

### Epic Context

**Epic 3: Incident Management (Safety Officer)**

Third story (3 of 6) in Safety Officer command center. Creates the detailed view that Safety Officers use to thoroughly review incidents before making assignment decisions. This is where the Safety Officer sees the full picture - photo evidence, description, severity, location context.

**Key Design Principle:** Complete incident visibility
- **Photo-first** - Large prominent photo (hero style) for visual assessment
- **Full information** - All incident details in single scrollable view
- **Assignment context** - Show who assigned it and when (if assigned)
- **Resolution context** - Show resolution notes and date (if resolved)
- **Back navigation** - Easy return to filtered/sorted list

### User Context

**Primary User:** Avi (Safety Officer)
- Views incident list with new incidents highlighted
- Taps incident card to see full details
- Needs to see photo clearly to assess severity
- Reads description and context
- Decides if assignment is needed and to whom
- Navigates back to list to continue triage

**Design-For Scenario:**
- Avi is on incident list, sees "חדש" (New) incident about oil spill
- Taps incident card → navigates to detail page
- Sees large photo showing oil puddle near machine
- Reads location: "קו ייצור ב" (Production Line B)
- Sees severity: "בינוני" (Major - Orange)
- Reads description: "שלולית שמן ליד מכונה 47" (Oil puddle near machine 47)
- Reporter: "יוסי כהן" (Yossi Cohen) - not anonymous
- Taps "שיוך" (Assign) button to assign to production manager (Story 3.4)

### Previous Story Intelligence

**Story 3.1 - Incident List View (COMPLETED):**

**Key Learnings:**
- ✅ `IncidentListPage` displays all incidents as cards
- ✅ `IncidentCard` component shows summary (severity, date, status, location)
- ✅ Navigation from card to detail will be via React Router (`navigate(/manage/incidents/${id})`)
- ✅ `useIncidents()` hook fetches all incidents
- ✅ `StatusChip` component maps status to colors (Blue/Orange/Green)
- ✅ `SeverityIndicator` component shows severity with colors
- ✅ Date formatting with `date-fns` (DD/MM/YYYY)

**Integration Points:**
- Detail page receives incident ID from route parameter
- Must fetch single incident by ID
- Can navigate to detail from list card

**Story 3.2 - List Sorting and Filtering (REVIEW):**

**Key Learnings:**
- ✅ Filtering by status (All/New/Assigned/Resolved)
- ✅ Sorting by date (newest/oldest)
- ✅ Client-side filtering with `useMemo`
- ✅ Status filter affects which incidents show in list
- ✅ When user navigates to detail and back, filter/sort state persists

**Integration Points:**
- Detail page URL: `/manage/incidents/:id`
- Back button returns to `/manage/incidents` (list maintains filter/sort state)
- Status changes (e.g., from assignment in Story 3.4) should update the incident

**Files Created in Previous Stories:**
- `safety-first/src/features/incidents/pages/IncidentListPage.tsx`
- `safety-first/src/features/incidents/hooks/useIncidents.ts`
- `safety-first/src/features/incidents/components/IncidentCard.tsx`
- `safety-first/src/features/incidents/components/StatusChip.tsx`
- `safety-first/src/features/incidents/components/SeverityIndicator.tsx`
- `safety-first/src/features/incidents/components/EmptyState.tsx`
- `safety-first/src/features/incidents/components/SortControl.tsx`
- `safety-first/src/features/incidents/components/FilterControl.tsx`
- `safety-first/src/features/incidents/api.ts` (contains `getIncidents()`)
- `safety-first/src/features/incidents/types.ts`

**Code Patterns Established:**
- Feature-based folder structure under `src/features/incidents/`
- React Context for auth (`AuthContext`)
- Supabase client queries with error handling
- Hebrew error messages in snackbars
- RTL layout with `marginInlineStart`/`marginInlineEnd`
- Date formatting with `date-fns` (DD/MM/YYYY HH:mm)
- MUI components with RTL theme
- Touch-friendly 48px targets
- Protected routes (requires authentication)

---

## Requirements Analysis

### Functional Requirements

**FR12:** "Safety Officer can view full details of any incident including photo"
- Navigate from list to detail page
- Display all incident fields
- Show photo prominently
- Full-screen photo viewer on tap

**FR13:** "Safety Officer can see the current status of each incident (new, assigned, resolved)"
- Already implemented via `StatusChip` in 3.1
- Detail page must also show status with same chip

**Acceptance Criteria:**

**AC1: Navigate to detail from list**
- **Given** I am viewing the incident list
- **When** I tap on an incident card
- **Then** I navigate to the incident detail page
- **And** I see the full incident information

**AC2: Display all incident information**
- **Given** I am on the incident detail page
- **When** I view the details
- **Then** I see: photo (large, tappable for full view), location, severity, date/time, description, reporter name (or "אנונימי" if anonymous), status, assigned to (if assigned), resolution notes (if resolved)

**AC3: Full-screen photo viewer**
- **Given** the incident has a photo
- **When** I tap the photo
- **Then** it opens in a full-screen viewer
- **And** I can zoom and pan

**AC4: No photo placeholder**
- **Given** the incident has no photo
- **When** I view the details
- **Then** a placeholder or "no photo" indicator is shown

**AC5: Back navigation**
- **Given** I am on the detail page
- **When** I tap the back button
- **Then** I return to the incident list
- **And** my filter/sort state is preserved

### Definition of Done

- [ ] `IncidentDetailPage` component at `/manage/incidents/:id`
- [ ] Photo displayed prominently (hero style)
- [ ] Full-screen photo viewer on tap
- [ ] All incident fields displayed with Hebrew labels
- [ ] Anonymous reporter shown as "אנונימי"
- [ ] Status chip with semantic color
- [ ] Severity indicator with color
- [ ] Back navigation to list
- [ ] Loading state while fetching incident
- [ ] Error handling if incident not found
- [ ] FR12 verified
- [ ] TypeScript compilation passes
- [ ] All tests pass (no regressions)

---

## Technical Specification

### Implementation Approach

**Component Architecture:**
```
IncidentDetailPage (route: /manage/incidents/:id)
  ├── PageHeader (with back button)
  ├── Loading state (while fetching)
  ├── Photo section (hero image, full-screen viewer)
  │   ├── Photo (large, tappable)
  │   └── PhotoViewer (modal/dialog for full-screen)
  ├── Incident Info Card
  │   ├── StatusChip (status)
  │   ├── SeverityIndicator (severity)
  │   ├── Location display
  │   ├── Date/time display (DD/MM/YYYY HH:mm)
  │   ├── Description
  │   ├── Reporter name (or "אנונימי")
  │   ├── Assignment info (if assigned)
  │   │   ├── Assigned to (user name)
  │   │   └── Assigned at (date)
  │   └── Resolution info (if resolved)
  │       ├── Resolution notes
  │       └── Resolved at (date)
  └── Error state (if not found)
```

**Data Flow:**
1. Component mounts → extract `id` from route params
2. Call `useIncident(id)` hook
3. Hook queries Supabase for incident by ID
4. Transform data → display in UI
5. Photo tap → open full-screen viewer modal

**Route:**
- Path: `/manage/incidents/:id`
- Example: `/manage/incidents/123e4567-e89b-12d3-a456-426614174000`
- Protected: Yes (requires auth)

### Files to Create/Modify

**New Files:**
1. `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Main detail page
2. `safety-first/src/features/incidents/components/PhotoViewer.tsx` - Full-screen photo modal
3. `safety-first/src/features/incidents/hooks/useIncident.ts` - Fetch single incident hook

**Modified Files:**
1. `safety-first/src/features/incidents/api.ts` - Add `getIncidentById(id)` function
2. `safety-first/src/routes/index.tsx` - Add `/manage/incidents/:id` route
3. `safety-first/src/features/incidents/components/IncidentCard.tsx` - Add click handler to navigate to detail

---

## Tasks Breakdown

### Task 1: Create API Function for Single Incident
**AC:** Can fetch incident by ID from Supabase

**Subtasks:**
1. [ ] Open `safety-first/src/features/incidents/api.ts`
2. [ ] Implement `getIncidentById(id: string)` function
3. [ ] Query `incidents` table with `.select('*').eq('id', id).single()`
4. [ ] Handle error if incident not found
5. [ ] Return typed `Incident` object
6. [ ] Export function

---

### Task 2: Create useIncident Hook
**AC:** Hook provides loading, data, error states for single incident

**Subtasks:**
1. [ ] Create `safety-first/src/features/incidents/hooks/useIncident.ts`
2. [ ] Accept `id: string` parameter
3. [ ] Use useState + useEffect OR React Query
4. [ ] Call `getIncidentById(id)` API function
5. [ ] Return `{ incident, isLoading, error }`
6. [ ] Handle loading and error states
7. [ ] Export hook

---

### Task 3: Create PhotoViewer Component
**AC:** Full-screen photo viewer with zoom/pan

**Subtasks:**
1. [ ] Create `safety-first/src/features/incidents/components/PhotoViewer.tsx`
2. [ ] Accept props: `open: boolean`, `photoUrl: string | null`, `onClose: () => void`
3. [ ] Use MUI `Dialog` component with `fullScreen` prop
4. [ ] Display photo in dialog
5. [ ] Add close button (X icon)
6. [ ] Add zoom/pan capability (optional - MUI Image or simple img)
7. [ ] RTL layout
8. [ ] Export component

---

### Task 4: Create IncidentDetailPage Component
**AC:** Page displays full incident details

**Subtasks:**
1. [ ] Create `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx`
2. [ ] Use `useParams()` from React Router to get `id`
3. [ ] Use `useIncident(id)` hook to fetch incident
4. [ ] Show loading state while `isLoading` (full-screen spinner)
5. [ ] Show error if `error` (Snackbar + message)
6. [ ] If `incident` not found → show "Incident not found" message
7. [ ] Display photo section:
   - Large photo (hero style)
   - Placeholder if no photo ("אין תמונה")
   - Tappable to open `PhotoViewer`
8. [ ] Display incident info card:
   - `StatusChip` (status)
   - `SeverityIndicator` (severity)
   - Location (fetch location name from `plant_locations` OR display location_id for now)
   - Date/time (formatted DD/MM/YYYY HH:mm)
   - Description (or "אין תיאור" if empty)
   - Reporter name (or "אנונימי" if null/empty)
9. [ ] If assigned:
   - Show "משויך ל:" (Assigned to) + user name (fetch from users table OR display assigned_to for now)
   - Show "תאריך שיוך:" (Assigned at) + formatted date
10. [ ] If resolved:
   - Show "הערות פתרון:" (Resolution notes) + notes
   - Show "תאריך פתרון:" (Resolved at) + formatted date
11. [ ] Add `PageHeader` with title "פרטי דיווח" (Incident Details) and back button
12. [ ] Back button navigates to `/manage/incidents`
13. [ ] RTL layout
14. [ ] Export component

---

### Task 5: Update Routes
**AC:** Route navigates to detail page

**Subtasks:**
1. [ ] Open `safety-first/src/routes/index.tsx`
2. [ ] Add route: `/manage/incidents/:id` → `IncidentDetailPage`
3. [ ] Ensure route is protected (inside protected route wrapper)
4. [ ] Test navigation

---

### Task 6: Update IncidentCard to Navigate
**AC:** Clicking card navigates to detail

**Subtasks:**
1. [ ] Open `safety-first/src/features/incidents/components/IncidentCard.tsx`
2. [ ] Import `useNavigate` from React Router
3. [ ] Add click handler: `onClick={() => navigate(/manage/incidents/${incident.id})}`
4. [ ] Ensure card is clickable (cursor pointer)
5. [ ] Test navigation from list to detail

---

### Task 7: Handle Location and Assignee Names
**AC:** Display location and assignee names (not just IDs)

**Subtasks:**
1. [ ] Option A: Join query in `getIncidentById()` to fetch location and user names
   - Update API: `.select('*, plant_locations(name_he), assigned_to_user:users!assigned_to(full_name)')`
2. [ ] Option B: Fetch separately with additional queries
3. [ ] Option C: Display IDs for MVP, enhance later
4. [ ] Recommendation: Start with Option C (IDs), add joins in refinement
5. [ ] Display location name in Hebrew if available
6. [ ] Display assignee name if assigned

---

### Task 8: Testing and Verification
**AC:** All acceptance criteria pass

**Subtasks:**
1. [ ] TypeScript compilation passes
2. [ ] Navigate from list to detail
3. [ ] Detail page displays all fields correctly
4. [ ] Photo shows prominently
5. [ ] Photo tap opens full-screen viewer
6. [ ] No photo shows placeholder
7. [ ] Anonymous reporter shows "אנונימי"
8. [ ] Status chip with correct color
9. [ ] Severity indicator with correct color
10. [ ] Date formatted DD/MM/YYYY HH:mm
11. [ ] Back button returns to list
12. [ ] List filter/sort state preserved
13. [ ] Hebrew labels throughout
14. [ ] RTL layout correct
15. [ ] Touch-friendly
16. [ ] All tests pass (no regressions)

---

## Developer Context & Guardrails

### 🔥 CRITICAL: Avoid These Common Mistakes

**1. Breaking Previous Stories**
- ✅ DO: Keep all Story 3.1 and 3.2 functionality intact
- ✅ DO: Test navigation from list to detail and back
- ❌ DON'T: Break `IncidentCard` click behavior
- ❌ DON'T: Lose filter/sort state when navigating

**2. Photo Handling**
- ✅ DO: Display photo prominently (hero style)
- ✅ DO: Handle missing photos gracefully (placeholder)
- ✅ DO: Make photo tappable for full-screen view
- ❌ DON'T: Fail if photo_url is null
- ❌ DON'T: Use <img> without error handling

**3. RTL Layout**
- ✅ DO: Use `marginInlineStart` / `marginInlineEnd`
- ✅ DO: Test with Hebrew text
- ❌ DON'T: Use `marginLeft` / `marginRight`
- ❌ DON'T: Hardcode LTR assumptions

**4. Date Formatting**
- ✅ DO: Use DD/MM/YYYY HH:mm format (Israeli)
- ✅ DO: Use `date-fns` for formatting
- ❌ DON'T: Use American MM/DD/YYYY format
- ❌ DON'T: Show raw ISO timestamps

**5. Anonymous Reporter Display**
- ✅ DO: Check if `reporter_name` is null or empty
- ✅ DO: Display "אנונימי" (Anonymous) for anonymous reports
- ❌ DON'T: Display "null" or empty string
- ❌ DON'T: Try to fetch reporter from users table (reporters don't have accounts)

**6. Loading and Error States**
- ✅ DO: Show loading spinner while fetching
- ✅ DO: Show error message if incident not found (404)
- ✅ DO: Handle network errors gracefully
- ❌ DON'T: Show blank page while loading
- ❌ DON'T: Crash if incident doesn't exist

---

### Critical Implementation Rules

**1. Hebrew Labels (NEVER FORGET)**
```typescript
// Field labels
const FIELD_LABELS = {
  location: 'מיקום',
  severity: 'חומרה',
  date: 'תאריך',
  time: 'שעה',
  description: 'תיאור',
  reporter: 'מדווח',
  status: 'סטטוס',
  assignedTo: 'משויך ל',
  assignedAt: 'תאריך שיוך',
  resolutionNotes: 'הערות פתרון',
  resolvedAt: 'תאריך פתרון',
}

// Anonymous reporter
const ANONYMOUS = 'אנונימי'

// No photo placeholder
const NO_PHOTO = 'אין תמונה'

// No description placeholder
const NO_DESCRIPTION = 'אין תיאור'
```

**2. Photo Display Pattern**
```typescript
// Hero photo section
<Box sx={{ position: 'relative', width: '100%', maxHeight: 400, overflow: 'hidden' }}>
  {incident.photo_url ? (
    <img
      src={incident.photo_url}
      alt="תמונת דיווח"
      style={{ width: '100%', cursor: 'pointer' }}
      onClick={() => setPhotoViewerOpen(true)}
    />
  ) : (
    <Box sx={{
      height: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.200'
    }}>
      <Typography variant="h6" color="text.secondary">אין תמונה</Typography>
    </Box>
  )}
</Box>

{/* Full-screen photo viewer */}
<PhotoViewer
  open={photoViewerOpen}
  photoUrl={incident.photo_url}
  onClose={() => setPhotoViewerOpen(false)}
/>
```

**3. Anonymous Reporter Pattern**
```typescript
// Display reporter name or "אנונימי"
const reporterDisplay = incident.reporter_name || 'אנונימי'

<Typography variant="body1">
  <strong>מדווח:</strong> {reporterDisplay}
</Typography>
```

**4. Date Formatting Pattern**
```typescript
import { format } from 'date-fns'

// Format date as DD/MM/YYYY HH:mm
const formattedDate = format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm')
const incidentDate = format(new Date(incident.incident_date), 'dd/MM/yyyy HH:mm')
```

**5. Fetch Single Incident Pattern**
```typescript
// In api.ts
export async function getIncidentById(id: string): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('שגיאה בטעינת פרטי הדיווח')
  }

  if (!data) {
    throw new Error('הדיווח לא נמצא')
  }

  return data
}
```

**6. useIncident Hook Pattern**
```typescript
// In useIncident.ts
import { useState, useEffect } from 'react'
import { getIncidentById } from '../api'
import type { Incident } from '../types'

export function useIncident(id: string) {
  const [incident, setIncident] = useState<Incident | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIncident() {
      try {
        setIsLoading(true)
        const data = await getIncidentById(id)
        setIncident(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת הדיווח')
        setIncident(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchIncident()
    }
  }, [id])

  return { incident, isLoading, error }
}
```

**7. Back Navigation Pattern**
```typescript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// In PageHeader or Back button
<IconButton onClick={() => navigate('/manage/incidents')}>
  <ArrowForwardIcon />  {/* Note: Forward icon for RTL back navigation */}
</IconButton>
```

**8. Full-Screen Photo Viewer Pattern**
```typescript
// PhotoViewer.tsx
import { Dialog, IconButton, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface PhotoViewerProps {
  open: boolean
  photoUrl: string | null
  onClose: () => void
}

export const PhotoViewer: FC<PhotoViewerProps> = ({ open, photoUrl, onClose }) => {
  if (!photoUrl) return null

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box sx={{ position: 'relative', height: '100%', bgcolor: 'black' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={photoUrl}
          alt="תמונת דיווח"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Dialog>
  )
}
```

---

### Architecture Compliance

**Technology Stack:**
- React 19.x ✅
- TypeScript 5.x ✅
- MUI 7.x ✅
- Supabase JS 2.x ✅
- React Router 7.x ✅
- date-fns ✅ (already installed in 3.1)

**Code Organization:**
```
safety-first/src/features/incidents/
  ├── pages/
  │   ├── IncidentListPage.tsx       (from 3.1)
  │   └── IncidentDetailPage.tsx     (NEW)
  ├── components/
  │   ├── IncidentCard.tsx           (MODIFY - add navigation)
  │   ├── StatusChip.tsx             (no change)
  │   ├── SeverityIndicator.tsx      (no change)
  │   ├── EmptyState.tsx             (no change)
  │   ├── SortControl.tsx            (no change)
  │   ├── FilterControl.tsx          (no change)
  │   └── PhotoViewer.tsx            (NEW)
  ├── hooks/
  │   ├── useIncidents.ts            (from 3.1)
  │   └── useIncident.ts             (NEW)
  ├── api.ts                         (MODIFY - add getIncidentById)
  └── types.ts                       (no change)
```

**Naming Conventions:**
- Components: PascalCase (`IncidentDetailPage`, `PhotoViewer`)
- Files: Match component name
- Functions: camelCase (`getIncidentById`, `formatDate`)
- Hooks: `use` prefix (`useIncident`)

**State Management:**
- Local component state (`useState`) ✅
- No need for Context or global state ✅
- `useEffect` for data fetching ✅

---

### Database Schema Reference

**No database changes required** - this story uses existing schema:

```sql
-- incidents table (from Epic 1.2)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name TEXT,                    -- NULL for anonymous
  severity TEXT NOT NULL,
  location_id UUID REFERENCES plant_locations(id),
  incident_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  photo_url TEXT,                        -- Supabase Storage URL
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Query Pattern:**
```typescript
// Simple single record query
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .eq('id', incidentId)
  .single()  // ← Returns single object instead of array
```

**Optional Enhancement (for location/assignee names):**
```typescript
// Join query to get location and assignee names
const { data, error } = await supabase
  .from('incidents')
  .select(`
    *,
    plant_locations(name_he),
    assigned_to_user:users!assigned_to(full_name)
  `)
  .eq('id', incidentId)
  .single()
```

---

### Common Mistakes to Avoid

**❌ DON'T:**
- Display raw ISO timestamps (use DD/MM/YYYY HH:mm)
- Show "null" for anonymous reporter (show "אנונימי")
- Crash if photo_url is null (show placeholder)
- Use `marginLeft`/`marginRight` (breaks RTL)
- Forget loading state
- Forget error handling
- Break back navigation
- Lose list filter state on navigation

**✅ DO:**
- Format all dates as DD/MM/YYYY HH:mm
- Display "אנונימי" for null reporter_name
- Handle missing photo gracefully
- Use `marginInlineStart`/`marginInlineEnd`
- Show loading spinner while fetching
- Handle 404 (incident not found)
- Navigate back to list with preserved state
- All labels in Hebrew
- Touch-friendly (48px minimum)

---

## Testing Strategy

### Manual Testing Checklist

**Navigation:**
1. [ ] Login as Safety Officer
2. [ ] Navigate to incident list
3. [ ] Verify incidents display
4. [ ] Tap an incident card
5. [ ] Verify navigation to detail page
6. [ ] URL is `/manage/incidents/:id`

**Display & Layout:**
7. [ ] Verify page displays in RTL
8. [ ] Photo shows prominently (if exists)
9. [ ] Placeholder shows if no photo
10. [ ] All fields display with Hebrew labels
11. [ ] Status chip with correct color
12. [ ] Severity indicator with correct color
13. [ ] Date formatted DD/MM/YYYY HH:mm
14. [ ] Reporter name or "אנונימי"

**Photo Viewer:**
15. [ ] Tap photo
16. [ ] Full-screen viewer opens
17. [ ] Photo displays correctly
18. [ ] Close button works
19. [ ] Tap outside closes viewer (optional)

**Assignment Info (if incident assigned):**
20. [ ] Shows "משויך ל:" + assignee name/ID
21. [ ] Shows "תאריך שיוך:" + date

**Resolution Info (if incident resolved):**
22. [ ] Shows "הערות פתרון:" + notes
23. [ ] Shows "תאריך פתרון:" + date

**Back Navigation:**
24. [ ] Tap back button
25. [ ] Returns to incident list
26. [ ] Filter state preserved
27. [ ] Sort state preserved

**Error Handling:**
28. [ ] Navigate to invalid ID: `/manage/incidents/invalid-uuid`
29. [ ] Verify error message shows
30. [ ] Disconnect network, navigate to detail
31. [ ] Verify error message in Hebrew

**Loading State:**
32. [ ] Navigate to detail
33. [ ] Verify loading spinner shows briefly
34. [ ] Verify content appears after loading

**Regression Testing:**
35. [ ] List page still works
36. [ ] Filtering still works
37. [ ] Sorting still works
38. [ ] Card clicks navigate correctly
39. [ ] TypeScript compiles
40. [ ] All tests pass

---

## References

### Project Artifacts

- **Epic:** `_bmad-output/epics.md` (lines 799-836) - Story 3.3 definition
- **Architecture:** `_bmad-output/architecture.md` - Tech stack, code organization
- **Project Context:** `_bmad-output/project-context.md` - Critical rules (RTL, dates, Hebrew)
- **UX Spec:** `_bmad-output/ux-design-specification.md` - Design patterns

### Code References (from Previous Stories)

- **Incident List Page:** `safety-first/src/features/incidents/pages/IncidentListPage.tsx:1`
- **useIncidents Hook:** `safety-first/src/features/incidents/hooks/useIncidents.ts:1`
- **IncidentCard:** `safety-first/src/features/incidents/components/IncidentCard.tsx:1` - To modify for navigation
- **StatusChip:** `safety-first/src/features/incidents/components/StatusChip.tsx:1` - Reuse
- **SeverityIndicator:** `safety-first/src/features/incidents/components/SeverityIndicator.tsx:1` - Reuse
- **API Functions:** `safety-first/src/features/incidents/api.ts:1` - Add getIncidentById
- **Types:** `safety-first/src/features/incidents/types.ts:1` - Incident type
- **Routes:** `safety-first/src/routes/index.tsx:1` - Add detail route

### Related Stories

- **Story 3.1:** Incident List View (COMPLETED) - Provides navigation source
- **Story 3.2:** List Sorting and Filtering (REVIEW) - Provides filter/sort state
- **Story 3.4:** Incident Assignment Workflow (NEXT) - Will add assignment UI to detail page
- **Story 3.5:** Recent Assignees Quick-Select (LATER)
- **Story 3.6:** New Assignee Selection (LATER)

### External Documentation

- [React Router useParams](https://reactrouter.com/en/main/hooks/use-params)
- [React Router useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)
- [MUI Dialog](https://mui.com/material-ui/react-dialog/)
- [Supabase Select Single](https://supabase.com/docs/reference/javascript/select#query-single-rows)
- [date-fns format](https://date-fns.org/docs/format)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

**Files to Create:**
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx`
- `safety-first/src/features/incidents/components/PhotoViewer.tsx`
- `safety-first/src/features/incidents/hooks/useIncident.ts`

**Files to Modify:**
- `safety-first/src/features/incidents/api.ts` (add getIncidentById)
- `safety-first/src/routes/index.tsx` (add detail route)
- `safety-first/src/features/incidents/components/IncidentCard.tsx` (add navigation)

---

**🎯 Story 3.3 Ready for Development!**

This story creates the detailed incident view that Safety Officers use to fully understand incidents before making assignment decisions. The comprehensive context above provides everything needed for flawless implementation.
