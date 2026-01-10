---
story_id: '6.1'
epic_id: '6'
epic_name: 'Incident Archiving'
title: 'Archive Incident'
status: 'done'
created: '2026-01-09'
---

# Story 6.1: Archive Incident

## Epic Context

**Epic 6: Incident Archiving**
**Goal:** IT Admin can archive incidents that were added by mistake, are redundant, fraudulent, or no longer relevant

**User Outcome:** Moshe (IT Admin) can archive incidents with an optional reason, and all authenticated users can view archived incidents in a dedicated archive page

**FRs Covered:** New functionality (not in original PRD)

## Story

**As an** IT Admin,
**I want** to archive incidents that are invalid or no longer relevant,
**So that** the active incident list only contains legitimate, actionable incidents.

## Acceptance Criteria

### AC1: Archive Button Visibility
- **Given** I am viewing an incident detail page
  **When** I am logged in as IT Admin
  **Then** I see an "ארכיון" (Archive) button
  **And** the button is NOT visible to non-admin users (Manager, Safety Officer)

- **Given** the incident is already archived
  **When** I view the detail page as IT Admin
  **Then** the Archive button is NOT shown (replaced by Restore button - Story 6.2)

### AC2: Archive Dialog
- **Given** I click the "ארכיון" button
  **When** the dialog opens
  **Then** I see a title "העברה לארכיון"
  **And** I see an optional text field for archive reason with placeholder "סיבת הארכוב (לא חובה)"
  **And** I see a "אשר" (Confirm) button
  **And** I see a "ביטול" (Cancel) button

### AC3: Archive Action
- **Given** the archive dialog is open
  **When** I click "אשר" (with or without entering a reason)
  **Then** the incident status changes to 'archived'
  **And** the `archived_at` timestamp is set to current time
  **And** the `archived_by` is set to the current user's ID
  **And** the `archive_reason` is saved (or null if not provided)
  **And** I see a success snackbar: "האירוע הועבר לארכיון"
  **And** I am navigated back to the incident list

### AC4: Error Handling
- **Given** the archive action fails (network error)
  **When** the error occurs
  **Then** I see a red error snackbar in Hebrew
  **And** the incident remains in its original status
  **And** the dialog remains open for retry

### AC5: Archived Incidents Hidden from Main List
- **Given** incidents exist with status 'archived'
  **When** I view the main incident list page
  **Then** archived incidents are NOT displayed
  **And** the status filter does NOT include an 'Archived' option

## Database Changes

Add new columns to the `incidents` table:
```sql
ALTER TABLE incidents
ADD COLUMN archived_at TIMESTAMPTZ,
ADD COLUMN archived_by UUID REFERENCES auth.users(id),
ADD COLUMN archive_reason TEXT;
```

Add new status value:
```sql
-- Update status check constraint or enum to include 'archived'
-- Status values: 'new', 'assigned', 'resolved', 'archived'
```

Update RLS policies to exclude archived from default queries (or handle in application layer).

## Tasks/Subtasks

- [x] Update types to include 'archived' status in IncidentStatus type
- [x] Add archived_at, archived_by, archive_reason fields to Incident interface
- [x] Create ArchiveDialog component with optional reason field
- [x] Add archiveIncident API function in api.ts
- [x] Update IncidentDetailPage with Archive button (IT Admin only)
- [x] Add role check using useAuth hook
- [x] Update getIncidents API to filter out archived incidents
- [x] Update StatusChip to handle 'archived' status

## Definition of Done

- [x] Archive button added to IncidentDetailPage (IT Admin only)
- [x] ArchiveDialog component created with optional reason field
- [x] New API function `archiveIncident(incidentId: string, reason?: string)` in api.ts
- [x] Database migration adds archived_at, archived_by, archive_reason columns (requires Supabase admin)
- [x] Status type updated to include 'archived'
- [x] Main incident list filters out archived incidents
- [x] Success/error snackbars in Hebrew
- [x] Build passes with no TypeScript errors
- [x] Navigation returns to incident list after successful archive

## Technical Notes

### Components to Create/Modify
- `ArchiveDialog.tsx` - New dialog component with optional reason field
- `IncidentDetailPage.tsx` - Add Archive button (visible to IT Admin only)
- `api.ts` - Add `archiveIncident()` function

### API Function
```typescript
export async function archiveIncident(incidentId: string, reason?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('incidents')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      archived_by: user?.id,
      archive_reason: reason || null,
    })
    .eq('id', incidentId)

  if (error) throw error
}
```

### Role Check
Use existing `useAuth()` hook to check if user role is 'it_admin':
```typescript
const { user } = useAuth()
const isAdmin = user?.role === 'it_admin'
```

### UI Placement
- Archive button should be positioned in the action buttons area
- Use outlined/secondary style to differentiate from primary actions (Assign, Resolve)
- Icon suggestion: Archive icon from MUI

## Out of Scope (Handled in Other Stories)
- Story 6.2: Restore (unarchive) functionality
- Story 6.3: Archive page with navigation tab
- Story 6.4: Display archive audit details (who archived, when, why)

## Dependencies
- Epic 1 (Authentication) - completed
- Story 5.1 (User roles) - completed

## Dev Agent Record

### Implementation Plan
1. Update TypeScript types to include 'archived' status
2. Add archive fields to Incident interface
3. Create ArchiveDialog component following ResolutionDialog pattern
4. Add archiveIncident API function
5. Update IncidentDetailPage with archive button and dialog
6. Filter archived incidents from main list
7. Update StatusChip to display archived status

### Debug Log
- Build passes with no TypeScript errors

### Completion Notes
Implementation complete. All frontend changes implemented:
- IncidentStatus type updated to include 'archived'
- Incident interface extended with archived_at, archived_by, archive_reason fields
- ArchiveDialog component created with Hebrew UI (title: "העברה לארכיון", placeholder: "סיבת הארכוב (לא חובה)")
- archiveIncident API function added with proper error handling
- Archive button added to IncidentDetailPage, visible only to IT Admin when incident is not archived
- getIncidents API filters out archived incidents using .neq('status', 'archived')
- StatusChip updated to display "בארכיון" for archived status with grey color

**Note:** Database migration for adding columns (archived_at, archived_by, archive_reason) needs to be run on Supabase by admin.

## File List

### New Files
- `safety-first/src/features/incidents/components/ArchiveDialog.tsx`

### Modified Files
- `safety-first/src/features/incidents/types.ts` - Added 'archived' to IncidentStatus, added archive fields to Incident
- `safety-first/src/features/incidents/api.ts` - Added archiveIncident function, updated getIncidents to exclude archived
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Added Archive button and dialog for IT Admin
- `safety-first/src/features/incidents/components/StatusChip.tsx` - Added archived status label and color

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-09 | Story created | User |
| 2026-01-09 | Implementation complete - all frontend changes | Claude Agent |
| 2026-01-09 | Fixed role check (user.role → role from useAuth), DB migration applied, story marked done | Claude Agent |
