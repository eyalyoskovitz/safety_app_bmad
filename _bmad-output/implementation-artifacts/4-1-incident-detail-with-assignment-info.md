# Story 4.1: Incident Detail with Assignment Info

Status: done

## Story

**As a** Manager viewing an assigned incident,
**I want** to see full details including assignment information,
**So that** I understand the context and who assigned it to me.

## Acceptance Criteria

**AC1:** Assignment information displayed
- Given I am on incident detail page
- When I view an incident assigned to me
- Then I see all incident details (photo, location, severity, date, description)
- And I see who assigned it to me (Safety Officer name)
- And I see when it was assigned (formatted DD/MM/YYYY HH:mm)

**AC2:** Resolution information displayed
- Given the incident was previously resolved
- When I view the details
- Then I also see resolution notes and resolution date

**AC3:** Resolve button visibility
- Given I am a Manager viewing an incident NOT assigned to me
- When I access the detail page
- Then I can view the details
- But I do NOT see the Resolve button (only assignee can resolve)

## Definition of Done

- [x] Assignment section on incident detail page
- [x] Show assigner name (query from users table)
- [x] Show assignment date/time formatted
- [x] Resolution section (if resolved)
- [x] Resolve button only shown to assignee
- [x] FR20 verified

---

## Context from Previous Stories

**Story 3.3 (COMPLETED) provided:**
- IncidentDetailPage at `/manage/incidents/:id` (safety-first/src/features/incidents/pages/IncidentDetailPage.tsx)
- useIncident(id) hook fetches incident with location joined (safety-first/src/features/incidents/hooks/useIncident.ts)
- PhotoViewer component for full-screen photo display

**Story 3.4 (COMPLETED) provided:**
- User types in `src/features/users/types.ts` with User interface
- useUsers() hook in `src/features/users/hooks/useUsers.ts`
- getUsers() API in `src/features/users/api.ts`
- assignIncident() API updates assigned_to and assigned_at fields

**This story enhances IncidentDetailPage - NO new page creation**

---

## Technical Specification

### Database Schema (Reference)

See architecture.md for full schema. Key fields for this story:

**incidents table** (relevant columns):
- `assigned_to` (UUID, FK to users.id) - Who incident is assigned to
- `assigned_at` (timestamptz) - When assignment occurred
- `status` (text) - 'new' | 'assigned' | 'resolved'
- `resolution_notes` (text, nullable) - Manager's resolution notes
- `resolved_at` (timestamptz, nullable) - When marked resolved

**users table** (for assigner name lookup):
- `id` (UUID, PK)
- `full_name` (text)
- `email` (text)

### API Enhancement

**getIncidentById() - Enhance with assignment join:**

Current query joins location. Need to ADD assigned user join:

```typescript
// In src/features/incidents/api.ts
export async function getIncidentById(id: string) {
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      plant_locations (
        id,
        name,
        name_he
      ),
      assigned_user:users!incidents_assigned_to_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error('שגיאה בטעינת האירוע')
  return data
}
```

**Key:** Uses Supabase FK join syntax with alias `assigned_user`

### Modified Components

**IncidentDetailPage** - Add assignment and resolution sections:

1. **Assignment Section** (show if incident.assigned_to exists):
   - Card with "מידע על השיוך" (Assignment Info) header
   - Display: assigned_user.full_name
   - Display: formatDateTime(incident.assigned_at)
   - Use formatDateTime() from utils (DD/MM/YYYY HH:mm)

2. **Resolution Section** (show if incident.status === 'resolved'):
   - Card with "מידע על הסגירה" (Resolution Info) header
   - Display: formatDateTime(incident.resolved_at)
   - Display: incident.resolution_notes (or "אין הערות" if null)

3. **Resolve Button** (placeholder for Story 4.2):
   - Show button ONLY if:
     - incident.status === 'assigned' AND
     - incident.assigned_to === currentUser.id
   - Button text: "סיום טיפול" (Mark Resolved)
   - DISABLED for now (Story 4.2 will implement action)
   - Add comment: "// TODO: Story 4.2 will implement resolution dialog"

### Type Updates

**Incident type enhancement:**

```typescript
// In src/features/incidents/types.ts
export interface Incident {
  // ... existing fields
  assigned_to: string | null
  assigned_at: string | null
  assigned_user?: {  // From join
    id: string
    full_name: string
    email: string
  } | null
  resolution_notes: string | null
  resolved_at: string | null
}
```

---

## Tasks

### Task 1: Enhance API with Assignment Join (AC1, AC2)
- [x] Open `src/features/incidents/api.ts`
- [x] Modify getIncidentById() to include assigned_user join
- [x] Test query returns assigned_user when incident is assigned

### Task 2: Update Incident Type (AC1, AC2)
- [x] Open `src/features/incidents/types.ts`
- [x] Add assigned_user optional nested type
- [x] Add resolution_notes and resolved_at fields

### Task 3: Add Assignment Section to Detail Page (AC1)
- [x] Open `src/features/incidents/pages/IncidentDetailPage.tsx`
- [x] After photo/details section, add assignment Card
- [x] Show if incident.assigned_to exists
- [x] Display assigned_user.full_name
- [x] Display formatDateTime(incident.assigned_at)
- [x] Use Hebrew labels: "שויך ל:" and "תאריך שיוך:"

### Task 4: Add Resolution Section to Detail Page (AC2)
- [x] In IncidentDetailPage, add resolution Card
- [x] Show if incident.status === 'resolved'
- [x] Display formatDateTime(incident.resolved_at)
- [x] Display incident.resolution_notes or "אין הערות"
- [x] Use Hebrew labels: "תאריך סגירה:" and "הערות:"

### Task 5: Add Conditional Resolve Button (AC3)
- [x] Get current user from AuthContext
- [x] Add button below details
- [x] Show ONLY if status==='assigned' AND assigned_to===currentUser.id
- [x] Button text: "סיום טיפול"
- [x] DISABLED with TODO comment for Story 4.2

### Task 6: Verify and Test
- [x] TypeScript compilation passes
- [x] Build successful (npm run build)
- [x] All acceptance criteria verified in code

---

## Developer Guardrails

### Reference Project Rules
- **RTL layout, Hebrew labels, date formats:** See project-context.md
- **Database schema:** See architecture.md lines 642-691
- **Supabase FK joins:** [Supabase Docs](https://supabase.com/docs/guides/api/joins-and-nested-tables)

### Story-Specific Patterns

**Supabase Foreign Key Join:**
```typescript
// Format: related_table:foreign_key_name (columns)
assigned_user:users!incidents_assigned_to_fkey (
  id,
  full_name,
  email
)
```

**Conditional Section Rendering:**
```typescript
{incident.assigned_to && (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6">מידע על השיוך</Typography>
      <Typography>שויך ל: {incident.assigned_user?.full_name}</Typography>
      <Typography variant="body2">
        תאריך שיוך: {formatDateTime(incident.assigned_at)}
      </Typography>
    </CardContent>
  </Card>
)}
```

**Current User Check:**
```typescript
import { useAuth } from '@/features/auth/context/AuthContext'

const { user } = useAuth()
const canResolve = incident.status === 'assigned' && incident.assigned_to === user?.id
```

### Critical Mistakes to Avoid

❌ **DON'T:**
- Create new page or route (enhance existing IncidentDetailPage)
- Show Resolve button for all managers (only assignee)
- Forget to handle null assigned_user (unassigned incidents)
- Make Resolve button functional yet (Story 4.2)

✅ **DO:**
- Reuse existing IncidentDetailPage from Story 3.3
- Add assignment/resolution sections conditionally
- Use formatDateTime() for consistent date display
- Check user.id matches assigned_to before showing button

---

## References

**Project Artifacts:**
- Epic 4: epics.md lines 877-920
- Architecture: architecture.md
- Project Context: project-context.md

**Code References:**
- IncidentDetailPage: safety-first/src/features/incidents/pages/IncidentDetailPage.tsx (from Story 3.3)
- useIncident hook: safety-first/src/features/incidents/hooks/useIncident.ts (from Story 3.3)
- Incident API: safety-first/src/features/incidents/api.ts
- User types: safety-first/src/features/users/types.ts (from Story 3.4)

**Related Stories:**
- Story 3.3 (COMPLETED) - Created IncidentDetailPage
- Story 3.4 (COMPLETED) - Added users feature and assignment workflow
- Story 4.2 (NEXT) - Will implement Resolve button functionality

**External Docs:**
- [Supabase FK Joins](https://supabase.com/docs/guides/api/joins-and-nested-tables)
- [MUI Card](https://mui.com/material-ui/react-card/)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Completed:** 2026-01-06

**Key Implementation Details:**
1. Enhanced getIncidentById() API with complete Supabase FK join for assigned_user (id, full_name, email)
2. Updated Incident type interface with assigned_user and plant_locations nested join types
3. Assignment and Resolution sections were already implemented in IncidentDetailPage (from previous stories)
4. Added conditional Resolve button that shows only to assigned user when status is 'assigned'
5. Button is disabled with TODO comment for Story 4.2 implementation
6. Fixed import path for useAuth hook (hooks/useAuth instead of context/AuthContext)

**Patterns Followed:**
- Explicit Supabase FK name syntax: `assigned_user:users!incidents_assigned_to_fkey`
- Conditional rendering with user.id matching assigned_to
- Hebrew button text and labels throughout
- RTL-compatible layout preserved
- TypeScript strict typing with optional nested types

**Build Status:** ✅ Successful (tsc + vite build passed)

**Manual Testing Improvements (Post-Implementation):**
1. Added `assigned_by` database field to track WHO assigned incidents
2. Enhanced API to fetch and store assigner information
3. Display "שויך על ידי" (Assigned by) in assignment section
4. Improved button layout:
   - Desktop: Buttons aligned in 3rd grid column (above assignment info)
   - Mobile: Buttons in horizontal row with Status/Severity
   - Small size matching Assign button style
5. Fixed button icon spacing on mobile (reduced gap)
6. Created migration: `20260106_add_assigned_by_field.sql`

**Testing Completed:**
- ✅ Desktop/laptop view tested - all layouts correct
- ✅ Mobile view tested - horizontal button layout works
- ✅ Assignment info displays correctly with assigner name
- ✅ Resolve button visibility rules working (assignee only)
- ✅ All acceptance criteria verified

### File List

**Files Modified:**
- `safety-first/src/features/incidents/api.ts` - Enhanced getIncidentById() with assigned_user and assigner joins, updated assignIncident() to track assigner
- `safety-first/src/features/incidents/types.ts` - Added assigned_by field, assigned_user, assigner, and plant_locations nested types
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Added useAuth, canResolve logic, Resolve button with responsive layout, assigner name display

**Files Created:**
- `safety-first/supabase/migrations/20260106_add_assigned_by_field.sql` - Database migration for assigned_by tracking

