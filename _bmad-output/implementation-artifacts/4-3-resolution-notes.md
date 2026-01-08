# Story 4.3: Resolution Notes

Status: done

## Story

**As a** Manager,
**I want** to add notes when resolving an incident,
**So that** I can document what was done to address the safety issue.

## Acceptance Criteria

**AC1:** Optional notes field in resolution dialog
- Given the resolution dialog is open
- When I view the form
- Then I see an optional text field for resolution notes
- And the field has Hebrew placeholder: "מה נעשה לטיפול בבעיה? (לא חובה)"

**AC2:** Notes are saved when provided
- Given I enter resolution notes
- When I confirm resolution
- Then the notes are saved to `resolution_notes` field
- And the incident is marked resolved

**AC3:** Resolution succeeds without notes
- Given I don't enter notes
- When I confirm resolution
- Then the incident is still marked resolved
- And `resolution_notes` remains null

**AC4:** Notes are visible on resolved incidents
- Given an incident has been resolved with notes
- When anyone views the detail page
- Then the resolution notes are visible

## Definition of Done

- [x] Text area in resolution dialog
- [x] Marked as optional
- [x] RTL text input
- [x] Notes saved to `resolution_notes` column
- [x] Notes displayed on resolved incident detail
- [x] FR22 verified

---

## Context from Previous Stories

**Story 4.2 (IN REVIEW) provided:**
- ResolutionDialog component at `safety-first/src/features/incidents/components/ResolutionDialog.tsx`
- Simple confirmation dialog with title, message, cancel/confirm buttons
- resolveIncident() API in `src/features/incidents/api.ts`
- Currently updates status='resolved' and resolved_at timestamp
- Dialog integration in IncidentDetailPage

**Story 4.1 (COMPLETED) provided:**
- Resolution section already displayed on IncidentDetailPage
- Shows resolution_notes if present, or "אין הערות" if null
- Location: `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx`

**This story ENHANCES existing components - NO new files needed**

---

## Technical Specification

### Database Schema (Reference)

See architecture.md lines 642-691 for full schema. This story uses:

**incidents table** (relevant column):
- `resolution_notes` (TEXT, nullable) - Manager's resolution notes

### API Enhancement

**resolveIncident() - Add notes parameter:**

Current function (from Story 4.2):
```typescript
export async function resolveIncident(incidentId: string)
```

Enhanced function:
```typescript
export async function resolveIncident(incidentId: string, resolutionNotes?: string)
```

Implementation:
```typescript
// In src/features/incidents/api.ts

export async function resolveIncident(incidentId: string, resolutionNotes?: string) {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes || null  // ADD THIS
    })
    .eq('id', incidentId)
    .select()
    .single()

  if (error) throw new Error('שגיאה בעדכון האירוע')
  return data
}
```

**Key Change:** Add optional resolutionNotes parameter, saved to resolution_notes field

### Component Enhancement

**ResolutionDialog.tsx - Add notes field:**

Changes needed:
1. Add `notes` prop to interface
2. Add `onNotesChange` callback to interface
3. Add MUI TextField for notes between DialogContent message and DialogActions
4. TextField should be multiline (3-4 rows)
5. Hebrew placeholder: "מה נעשה לטיפול בבעיה? (לא חובה)"
6. Label: "הערות" with "(לא חובה)" indication

Enhanced interface:
```typescript
interface ResolutionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
  notes: string                          // ADD THIS
  onNotesChange: (notes: string) => void // ADD THIS
}
```

Enhanced JSX:
```typescript
<DialogContent>
  <Typography>
    האם אתה בטוח שברצונך לסגור את האירוע?
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
    לאחר הסגירה, האירוע יסומן כטופל.
  </Typography>

  {/* ADD THIS TEXT FIELD */}
  <TextField
    fullWidth
    multiline
    rows={3}
    label="הערות (לא חובה)"
    placeholder="מה נעשה לטיפול בבעיה?"
    value={notes}
    onChange={(e) => onNotesChange(e.target.value)}
    sx={{ mt: 2 }}
    inputProps={{ dir: 'rtl' }}  // RTL text input
  />
</DialogContent>
```

**IncidentDetailPage.tsx - Add notes state and pass to dialog:**

Changes needed:
1. Add state: `const [resolutionNotes, setResolutionNotes] = useState('')`
2. Update handleResolve to pass notes to API: `await resolveIncident(incident.id, resolutionNotes)`
3. Clear notes after success: `setResolutionNotes('')`
4. Pass props to ResolutionDialog: `notes={resolutionNotes}` and `onNotesChange={setResolutionNotes}`

Updated handleResolve:
```typescript
const handleResolve = async () => {
  setIsResolving(true)
  try {
    await resolveIncident(incident.id, resolutionNotes)  // ADD resolutionNotes param
    setShowResolveDialog(false)
    setResolutionNotes('')  // CLEAR notes
    setSnackbar({ message: 'האירוע נסגר בהצלחה', severity: 'success' })
    refetch()
  } catch (error) {
    setSnackbar({
      message: 'שגיאה בסגירת האירוע. נסה שוב',
      severity: 'error'
    })
  } finally {
    setIsResolving(false)
  }
}
```

Updated ResolutionDialog usage:
```typescript
<ResolutionDialog
  open={showResolveDialog}
  onClose={() => setShowResolveDialog(false)}
  onConfirm={handleResolve}
  isSubmitting={isResolving}
  notes={resolutionNotes}            // ADD THIS
  onNotesChange={setResolutionNotes} // ADD THIS
/>
```

**Note:** Resolution notes display is ALREADY implemented in Story 4.1's resolution section. No changes needed there.

---

## Tasks

### Task 1: Enhance resolveIncident API to accept notes (AC2, AC3)
- [x] Open `src/features/incidents/api.ts`
- [x] Add optional `resolutionNotes` parameter to resolveIncident()
- [x] Update incidents table to include resolution_notes field
- [x] Save notes or null if not provided

### Task 2: Enhance ResolutionDialog with notes field (AC1)
- [x] Open `src/features/incidents/components/ResolutionDialog.tsx`
- [x] Add notes and onNotesChange to props interface
- [x] Import TextField from MUI
- [x] Add TextField below confirmation message
- [x] Multiline (3 rows), full width
- [x] Hebrew placeholder and label
- [x] RTL text input (dir="rtl")

### Task 3: Add notes state to IncidentDetailPage (AC2, AC3)
- [x] Open `src/features/incidents/pages/IncidentDetailPage.tsx`
- [x] Add state: `const [resolutionNotes, setResolutionNotes] = useState('')`
- [x] Update handleResolve to pass resolutionNotes to API
- [x] Clear notes after successful resolution
- [x] Pass notes and onNotesChange props to ResolutionDialog

### Task 4: Verify notes display (AC4)
- [x] Verify Story 4.1's resolution section displays notes correctly
- [x] No changes needed (already implemented)
- [x] Test that notes show on resolved incident detail page

### Task 5: Build and verify
- [x] TypeScript compilation passes (npm run build)
- [x] All acceptance criteria verified
- [x] FR22 verified

---

## Developer Guardrails

### Reference Project Rules
- **RTL layout, Hebrew labels, date formats:** See project-context.md
- **Database schema:** See architecture.md lines 642-691
- **TextField RTL pattern:** Use `inputProps={{ dir: 'rtl' }}`

### Story-Specific Patterns

**Optional TextField Pattern:**
```typescript
<TextField
  fullWidth
  multiline
  rows={3}
  label="הערות (לא חובה)"
  placeholder="מה נעשה לטיפול בבעיה?"
  value={notes}
  onChange={(e) => onNotesChange(e.target.value)}
  sx={{ mt: 2 }}
  inputProps={{ dir: 'rtl' }}
/>
```

**Optional Parameter Pattern:**
```typescript
// Function signature
export async function resolveIncident(incidentId: string, resolutionNotes?: string)

// Usage in update
resolution_notes: resolutionNotes || null  // null if empty/undefined
```

**State Management Pattern:**
```typescript
const [resolutionNotes, setResolutionNotes] = useState('')

// Pass to child
<Component notes={resolutionNotes} onNotesChange={setResolutionNotes} />

// Clear after success
setResolutionNotes('')
```

### Critical Mistakes to Avoid

❌ **DON'T:**
- Make notes field required (it's optional per AC3)
- Create new components (enhance existing ResolutionDialog)
- Modify resolution notes display (already done in Story 4.1)
- Forget RTL direction for text input
- Use English placeholders

✅ **DO:**
- Mark field as optional in label: "(לא חובה)"
- Use multiline TextField (3-4 rows)
- Save null if notes are empty
- Clear notes state after successful resolution
- Follow RTL text input pattern from project-context.md

### Token Efficiency Notes

**This story references (not repeats):**
- RTL/Hebrew/date rules → project-context.md
- Database schema → architecture.md lines 642-691
- ResolutionDialog component → Story 4.2
- Notes display → Story 4.1 resolution section
- Tech stack → architecture.md

**This story adds (new/unique):**
- Optional notes TextField in ResolutionDialog
- resolutionNotes parameter to resolveIncident API
- Notes state management in IncidentDetailPage
- Hebrew placeholder for notes field

---

## References

**Project Artifacts:**
- Epic 4: epics.md lines 962-997
- Architecture: architecture.md
- Project Context: project-context.md

**Code References:**
- ResolutionDialog: safety-first/src/features/incidents/components/ResolutionDialog.tsx (from Story 4.2)
- IncidentDetailPage: safety-first/src/features/incidents/pages/IncidentDetailPage.tsx (from Stories 3.3, 4.1, 4.2)
- Incident API: safety-first/src/features/incidents/api.ts

**Related Stories:**
- Story 4.1 (COMPLETED) - Added resolution info display on detail page
- Story 4.2 (IN REVIEW) - Created ResolutionDialog, resolveIncident API
- Story 4.4 (NEXT) - Will add assignee visibility and filtering

**External Docs:**
- [MUI TextField](https://mui.com/material-ui/react-text-field/)
- [Supabase Update](https://supabase.com/docs/reference/javascript/update)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

**Completed:** 2026-01-06

**Implementation Summary:**

1. **API Enhancement (Task 1):**
   - Enhanced `resolveIncident()` function in `api.ts` to accept optional `resolutionNotes` parameter
   - Added `resolution_notes: resolutionNotes || null` to update statement
   - Saves null if notes are empty/undefined, meeting AC3 requirement

2. **Dialog Enhancement (Task 2):**
   - Added TextField import to ResolutionDialog component
   - Extended props interface with `notes: string` and `onNotesChange: (notes: string) => void`
   - Added multiline TextField (3 rows) with:
     - Hebrew label: "הערות (לא חובה)" (clearly marked as optional per AC1)
     - Hebrew placeholder: "מה נעשה לטיפול בבעיה?"
     - RTL text input via `inputProps={{ dir: 'rtl' }}`
     - Proper spacing with `sx={{ mt: 2 }}`

3. **State Management (Task 3):**
   - Added `resolutionNotes` state to IncidentDetailPage
   - Updated `handleResolve` to pass notes to API: `await resolveIncident(incident.id, resolutionNotes)`
   - Clear notes after successful resolution: `setResolutionNotes('')`
   - Pass notes props to ResolutionDialog component

4. **Display Verification (Task 4):**
   - Verified resolution notes display was already implemented in Story 4.1
   - Notes appear in resolution section when incident is resolved (lines 349-356)
   - Shows under "הערות פתרון" label, meeting AC4 requirement

**All Acceptance Criteria Verified:**
- ✅ AC1: Optional notes field in dialog with Hebrew placeholder
- ✅ AC2: Notes saved when provided
- ✅ AC3: Resolution succeeds without notes (null saved)
- ✅ AC4: Notes visible on resolved incidents

**Build Status:** ✅ Successful (TypeScript + Vite build passed)

**Patterns Followed:**
- Optional parameter pattern: `resolutionNotes?: string`
- Null handling: `resolutionNotes || null`
- RTL text input: `inputProps={{ dir: 'rtl' }}`
- Hebrew labels throughout
- State management with useState hook
- Props drilling pattern for controlled component

**Post-Implementation Fixes (2026-01-06):**

After initial implementation, the following UX improvements were made based on user feedback:

1. **TextField Label Spacing (RTL):**
   - Added proper spacing for empty field label: `right: '22px !important'`
   - Adjusted floating label position to move left when focused: `right: '26px !important'`
   - Ensures label doesn't touch border in RTL layout

2. **Label Text Updates:**
   - Dialog label: "הערות (לא חובה)" → "מה נעשה (לא חובה)"
   - Incident detail label: "הערות פתרון" → "מה נעשה"
   - Section titles simplified: "מידע פתרון" → "פתרון", "מידע שיוך" → "שיוך"

3. **Incident Detail Layout:**
   - Desktop: "מה נעשה" field moved to second column (not below date)
   - Always shows field with "אין מידע" when empty (not hidden)

4. **Scroll Position Preservation:**
   - Added sessionStorage-based scroll restoration for incident list
   - Saves position on navigation, restores on return
   - Uses useRef to prevent multiple restoration attempts
   - 50ms delay ensures DOM is fully rendered before scroll

### File List

**Files Modified:**
- `safety-first/src/features/incidents/api.ts` - Enhanced resolveIncident() with optional resolutionNotes parameter
- `safety-first/src/features/incidents/components/ResolutionDialog.tsx` - Added TextField for resolution notes with proper RTL label spacing
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Added notes state management, improved layout, and scroll position preservation for list navigation
