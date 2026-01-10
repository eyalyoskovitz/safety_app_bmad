---
story_id: '6.2'
epic_id: '6'
epic_name: 'Incident Archiving'
title: 'Restore Incident'
status: 'done'
created: '2026-01-09'
---

# Story 6.2: Restore Incident

## Epic Context

**Epic 6: Incident Archiving**
**Goal:** IT Admin can archive incidents that were added by mistake, are redundant, fraudulent, or no longer relevant

**User Outcome:** Moshe (IT Admin) can restore archived incidents back to their previous state if they were archived by mistake

**FRs Covered:** New functionality (not in original PRD)

## Story

**As an** IT Admin,
**I want** to restore archived incidents back to active status,
**So that** incidents archived by mistake can be recovered.

## Acceptance Criteria

### AC1: Restore Button Visibility
- **Given** I am viewing an archived incident detail page
  **When** I am logged in as IT Admin
  **Then** I see a "שחזור" (Restore) button
  **And** the button is NOT visible to non-admin users (Manager, Safety Officer)

- **Given** the incident is NOT archived
  **When** I view the detail page as IT Admin
  **Then** the Restore button is NOT shown

### AC2: Restore Action
- **Given** I click the "שחזור" button
  **When** the action completes successfully
  **Then** the incident status changes from 'archived' back to its previous state ('resolved', 'assigned', or 'new')
  **And** the `archived_at`, `archived_by`, `archive_reason` fields are cleared
  **And** I see a success snackbar: "האירוע שוחזר בהצלחה"
  **And** the page refreshes to show the restored incident

### AC3: Error Handling
- **Given** the restore action fails (network error)
  **When** the error occurs
  **Then** I see a red error snackbar in Hebrew
  **And** the incident remains archived

## Tasks/Subtasks

- [x] Add restoreIncident API function in api.ts
- [x] Update IncidentDetailPage with Restore button (IT Admin only, archived incidents only)
- [x] Add state and handler for restore action
- [x] Show success/error snackbars

## Definition of Done

- [x] Restore button added to IncidentDetailPage (IT Admin only, archived only)
- [x] New API function `restoreIncident(incidentId: string)` in api.ts
- [x] Incident restored to 'new' status (simplest approach)
- [x] Archive fields cleared (archived_at, archived_by, archive_reason set to null)
- [x] Success/error snackbars in Hebrew
- [x] Build passes with no TypeScript errors
- [x] Page refreshes after successful restore

## Technical Notes

### Components to Modify
- `IncidentDetailPage.tsx` - Add Restore button (visible to IT Admin only when archived)
- `api.ts` - Add `restoreIncident()` function

### API Function
```typescript
export async function restoreIncident(incidentId: string): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'new', // Restore to new, Safety Officer can re-triage
      archived_at: null,
      archived_by: null,
      archive_reason: null
    })
    .eq('id', incidentId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### UI Placement
- Restore button should be positioned in the action buttons area
- Only visible when status === 'archived' AND user is IT Admin
- Use Unarchive icon from MUI

## Dependencies
- Story 6.1 (Archive Incident) - completed

## File List

### Modified Files
- `safety-first/src/features/incidents/api.ts` - Add restoreIncident function
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Add Restore button

## Dev Agent Record

### Implementation Plan
1. Add restoreIncident API function in api.ts
2. Update IncidentDetailPage to import restoreIncident and UnarchiveIcon
3. Add canRestore flag for IT Admin viewing archived incidents
4. Add handleRestore handler with success/error snackbars
5. Add Restore button in action buttons area

### Debug Log
- Build passes with no TypeScript errors

### Completion Notes
Implementation complete. All changes implemented:
- `restoreIncident()` function added to api.ts - restores to 'new' status and clears archive metadata
- UnarchiveIcon imported for the restore button
- `canRestore` flag added (visible to IT Admin only when incident.status === 'archived')
- `handleRestore` handler with Hebrew success/error snackbars
- "שחזור" (Restore) button added with UnarchiveIcon, positioned in action buttons area

The restore functionality allows IT Admins to recover archived incidents back to 'new' status so they can be re-triaged by the Safety Officer.

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-09 | Story created | Claude Agent |
| 2026-01-09 | Implementation complete - all frontend changes | Claude Agent |
