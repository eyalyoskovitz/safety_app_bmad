# Story 4.2: Mark Incident as Resolved

Status: review

## Story

**As a** Manager,
**I want** to mark an incident as resolved,
**So that** I can close the loop on safety issues I've addressed.

## Acceptance Criteria

**AC1:** Resolve button triggers resolution dialog
- Given I am viewing an incident assigned to me (status = "assigned")
- When I tap the "סיום טיפול" (Resolve) button
- Then a resolution dialog/sheet opens
- And I can confirm resolution

**AC2:** Resolution without notes succeeds
- Given the resolution dialog is open
- When I confirm without notes
- Then the incident status changes to "resolved"
- And the `resolved_at` timestamp is set
- And I see a success snackbar: "האירוע נסגר בהצלחה"
- And the dialog closes

**AC3:** Resolution failure handling
- Given the resolution fails (network error)
- When the error occurs
- Then I see a red error snackbar in Hebrew
- And the incident remains assigned

**AC4:** Resolved incidents hide Resolve button
- Given an incident is already resolved
- When I view the detail page
- Then the Resolve button is not shown (or disabled)
- And I see the resolution information instead

## Definition of Done

- [x] "Resolve" button on incident detail (for assignee only) - **Already exists from Story 4.1**
- [x] Resolution dialog/sheet component
- [x] Update incident `status = 'resolved'`, `resolved_at`
- [x] Success/error snackbars in Hebrew
- [x] Button hidden after resolution
- [x] FR21 verified

---

## Context from Previous Stories

**Story 4.1 (COMPLETED) provided:**
- Resolve button already added to IncidentDetailPage (DISABLED with TODO comment)
- Button visibility logic: `status === 'assigned' && assigned_to === user.id`
- Responsive button layout pattern established
- useAuth hook for current user
- IncidentDetailPage location: `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx`

**This story ACTIVATES the existing button - NO new button creation needed**

---

## Technical Specification

### Database Schema (Reference)

See architecture.md for full schema. This story updates:

**incidents table** (relevant columns):
- `status` (text) - Will change from 'assigned' to 'resolved'
- `resolved_at` (timestamptz) - Will be set to NOW()
- Note: `resolution_notes` will be handled in Story 4.3

### API Function

**resolveIncident() - New API function:**

```typescript
// In src/features/incidents/api.ts

export async function resolveIncident(incidentId: string) {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString()
    })
    .eq('id', incidentId)
    .select()
    .single()

  if (error) throw new Error('שגיאה בעדכון האירוע')
  return data
}
```

**Key Details:**
- Updates status to 'resolved'
- Sets resolved_at to current timestamp
- Returns updated incident for UI refresh
- Throws Hebrew error message on failure

### New Component

**ResolutionDialog.tsx - Simple confirmation dialog:**

Location: `safety-first/src/features/incidents/components/ResolutionDialog.tsx`

```typescript
import { FC } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material'

interface ResolutionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
}

export const ResolutionDialog: FC<ResolutionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>סיום טיפול באירוע</DialogTitle>
      <DialogContent>
        <Typography>
          האם אתה בטוח שברצונך לסגור את האירוע?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          לאחר הסגירה, האירוע יסומן כטופל.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          ביטול
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isSubmitting}
          autoFocus
        >
          {isSubmitting ? 'שומר...' : 'סגור אירוע'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

**Design Notes:**
- Simple confirmation dialog (no notes field - that's Story 4.3)
- Hebrew labels throughout
- Loading state during submission
- RTL layout automatic from theme
- MUI Dialog component (not bottom sheet for this simple flow)

### Modified Component

**IncidentDetailPage.tsx - Activate Resolve button:**

Changes needed:
1. Import ResolutionDialog component
2. Add dialog state: `const [showResolveDialog, setShowResolveDialog] = useState(false)`
3. Add submission state: `const [isResolving, setIsResolving] = useState(false)`
4. Add snackbar for success/error (reuse existing pattern from assignment)
5. Remove `disabled` prop from Resolve button
6. Add `onClick={() => setShowResolveDialog(true)}` to Resolve button
7. Implement handleResolve function that calls API
8. Add ResolutionDialog component at end of component

```typescript
// Add to imports
import { ResolutionDialog } from '../components/ResolutionDialog'
import { resolveIncident } from '../api'

// Add state (after existing state declarations)
const [showResolveDialog, setShowResolveDialog] = useState(false)
const [isResolving, setIsResolving] = useState(false)

// Add resolve handler
const handleResolve = async () => {
  setIsResolving(true)
  try {
    await resolveIncident(incident.id)
    setShowResolveDialog(false)
    setSnackbar({ message: 'האירוע נסגר בהצלחה', severity: 'success' })
    // Refresh incident data
    refetch() // or mutate() depending on data fetching pattern
  } catch (error) {
    setSnackbar({
      message: 'שגיאה בסגירת האירוע. נסה שוב',
      severity: 'error'
    })
  } finally {
    setIsResolving(false)
  }
}

// Update Resolve button (remove disabled, add onClick)
<Button
  variant="contained"
  color="success"
  startIcon={<CheckCircleIcon />}
  onClick={() => setShowResolveDialog(true)}  // ADD THIS
  size="small"
>
  סיום טיפול
</Button>

// Add dialog before closing component
<ResolutionDialog
  open={showResolveDialog}
  onClose={() => setShowResolveDialog(false)}
  onConfirm={handleResolve}
  isSubmitting={isResolving}
/>
```

**Integration Points:**
- Reuse existing snackbar pattern from assignment workflow
- Reuse existing data refetch pattern (likely useIncident hook has refetch)
- Button already exists from Story 4.1, just activate it

---

## Tasks

### Task 1: Create resolveIncident API function (AC2, AC3)
- [x] Open `src/features/incidents/api.ts`
- [x] Add resolveIncident() function
- [x] Update incidents table: status='resolved', resolved_at=NOW()
- [x] Return updated incident
- [x] Hebrew error message on failure

### Task 2: Create ResolutionDialog component (AC1, AC2)
- [x] Create `src/features/incidents/components/ResolutionDialog.tsx`
- [x] MUI Dialog with title, content, actions
- [x] Hebrew confirmation message
- [x] Cancel and Confirm buttons
- [x] Disable buttons during submission
- [x] Loading text during submission

### Task 3: Activate Resolve button in IncidentDetailPage (AC1, AC2, AC3, AC4)
- [x] Open `src/features/incidents/pages/IncidentDetailPage.tsx`
- [x] Import ResolutionDialog and resolveIncident API
- [x] Add state: showResolveDialog, isResolving
- [x] Remove `disabled` prop from Resolve button
- [x] Add onClick handler to open dialog
- [x] Implement handleResolve function
- [x] Call resolveIncident API
- [x] Show success/error snackbar
- [x] Refresh incident data after success
- [x] Add ResolutionDialog component to render

### Task 4: Verify and Test
- [x] TypeScript compilation passes
- [x] Build successful (npm run build)
- [x] All acceptance criteria verified in code

---

## Developer Guardrails

### Reference Project Rules
- **RTL layout, Hebrew labels, date formats:** See project-context.md
- **Database schema:** See architecture.md lines 642-691
- **Error handling:** Hebrew snackbars (project-context.md lines 120-130)

### Story-Specific Patterns

**Dialog Pattern (Simple Confirmation):**
```typescript
// Use MUI Dialog, not bottom sheet for this simple flow
<Dialog open={open} onClose={onClose}>
  <DialogTitle>Hebrew title</DialogTitle>
  <DialogContent>
    <Typography>Hebrew confirmation message</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>ביטול</Button>
    <Button onClick={onConfirm} variant="contained">אישור</Button>
  </DialogActions>
</Dialog>
```

**Supabase Update Pattern:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ field: value })
  .eq('id', id)
  .select()
  .single()
```

**Success Snackbar Pattern:**
```typescript
setSnackbar({
  message: 'Hebrew success message',
  severity: 'success'
})
```

### Critical Mistakes to Avoid

❌ **DON'T:**
- Create a new Resolve button (it already exists from Story 4.1)
- Add resolution notes field (that's Story 4.3)
- Use bottom sheet for simple confirmation (Dialog is cleaner)
- Show button for non-assigned users (logic already implemented)
- Forget to refresh incident data after resolution

✅ **DO:**
- Remove disabled prop and activate existing button
- Use simple MUI Dialog for confirmation
- Reuse existing snackbar pattern
- Reuse existing data fetching/refetch pattern
- Follow Hebrew error messages from project-context.md

### Token Efficiency Notes

**This story references (not repeats):**
- RTL/Hebrew rules → project-context.md
- Database schema → architecture.md lines 642-691
- Button layout pattern → Story 4.1
- Snackbar pattern → Previous stories (3.4 assignment)
- Tech stack → architecture.md

**This story adds (new/unique):**
- ResolutionDialog component (simple confirmation)
- resolveIncident API function
- Activation of existing Resolve button
- Resolution success/error flow

---

## References

**Project Artifacts:**
- Epic 4: epics.md lines 877-997
- Architecture: architecture.md
- Project Context: project-context.md

**Code References:**
- IncidentDetailPage: safety-first/src/features/incidents/pages/IncidentDetailPage.tsx (from Story 3.3, enhanced in 4.1)
- Incident API: safety-first/src/features/incidents/api.ts
- Incident types: safety-first/src/features/incidents/types.ts

**Related Stories:**
- Story 3.3 (COMPLETED) - Created IncidentDetailPage
- Story 3.4 (COMPLETED) - Added assignment workflow with snackbar patterns
- Story 4.1 (COMPLETED) - Added Resolve button (disabled), assignment info display
- Story 4.3 (NEXT) - Will add resolution notes field to dialog

**External Docs:**
- [MUI Dialog](https://mui.com/material-ui/react-dialog/)
- [Supabase Update](https://supabase.com/docs/reference/javascript/update)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

**Completed:** 2026-01-06

**Implementation Summary:**
1. Created resolveIncident() API function following existing assignIncident pattern
   - Updates incident status to 'resolved'
   - Sets resolved_at timestamp
   - Returns updated incident
   - Hebrew error message: 'שגיאה בעדכון האירוע'

2. Created ResolutionDialog component
   - Simple confirmation dialog using MUI Dialog
   - Hebrew labels throughout
   - Loading state during submission
   - Disabled buttons while processing
   - Auto-focus on confirm button

3. Activated Resolve button in IncidentDetailPage
   - Added state for dialog (showResolveDialog, isResolving)
   - Removed disabled prop from existing button
   - Implemented handleResolve function with error handling
   - Added success/error snackbars with Hebrew messages
   - Auto-refresh incident data after resolution
   - Dialog component integrated into page

**All Acceptance Criteria Verified:**
- ✅ AC1: Resolve button triggers resolution dialog
- ✅ AC2: Resolution without notes succeeds (status → resolved, resolved_at set, success snackbar, dialog closes)
- ✅ AC3: Resolution failure handling (error snackbar, incident remains assigned)
- ✅ AC4: Resolved incidents hide Resolve button (button only shows when canResolve = true)

**Build Status:** ✅ Successful (TypeScript + Vite build passed)

**Patterns Followed:**
- Type-only import for FC (import type { FC })
- Hebrew error messages throughout
- Supabase update pattern with .select().single()
- Snackbar pattern from previous stories
- Refetch pattern from useIncident hook
- RTL-compatible layout (automatic from theme)

### File List

**Files Created:**
- `safety-first/src/features/incidents/components/ResolutionDialog.tsx` - Resolution confirmation dialog component

**Files Modified:**
- `safety-first/src/features/incidents/api.ts` - Added resolveIncident() function
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Activated Resolve button with dialog integration
