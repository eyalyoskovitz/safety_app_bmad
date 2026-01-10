---
story_id: '6.4'
epic_id: '6'
epic_name: 'Incident Archiving'
title: 'Archive Audit Display'
status: 'done'
created: '2026-01-10'
---

# Story 6.4: Archive Audit Display

## Epic Context

**Epic 6: Incident Archiving**
**Goal:** IT Admin can archive incidents and view archived incidents in a dedicated page

**User Outcome:** All authenticated users can view archive audit information (when archived, by whom, reason) when viewing an archived incident's details

**FRs Covered:** FR-ARCHIVE-5 (Archive Audit Trail)

## Story

**As an** authenticated user,
**I want** to see when and by whom an incident was archived along with the reason,
**So that** I can understand the archive history and context.

## Acceptance Criteria

### AC1: Archive Details Section
- **Given** I am viewing an archived incident's detail page
  **When** the page loads
  **Then** I see an "ארכיון" (Archive) section with archive details
  **And** the section shows: archive date, archived by (user name), archive reason (if provided)

### AC2: Archive Date Display
- **Given** I am viewing an archived incident's details
  **When** I look at the Archive section
  **Then** I see "תאריך ארכוב" (Archive Date) with the date formatted as dd/MM/yyyy HH:mm

### AC3: Archiver Name Display
- **Given** I am viewing an archived incident's details
  **When** I look at the Archive section
  **Then** I see "ארכוב על ידי" (Archived By) with the full name of the user who archived the incident

### AC4: Archive Reason Display (Optional)
- **Given** the incident was archived with a reason
  **When** I view the Archive section
  **Then** I see "סיבת ארכוב" (Archive Reason) with the provided reason
- **Given** the incident was archived without a reason
  **When** I view the Archive section
  **Then** I do not see the Archive Reason field

### AC5: Visibility for All Authenticated Users
- **Given** I am logged in as any authenticated user (safety_officer, responder, it_admin, or manager)
  **When** I navigate to an archived incident's detail page
  **Then** I can see the archive audit information

## Tasks/Subtasks

- [x] Add archiver join to getIncidentById API (handled separately to avoid FK issues)
- [x] Add Archive Info section to IncidentDetailPage component
- [x] Display archive date formatted as dd/MM/yyyy HH:mm
- [x] Display archiver name from joined user data
- [x] Conditionally display archive reason if provided
- [x] Test build passes

## Definition of Done

- [x] Archive details section displays on archived incident detail page
- [x] Archive date displays correctly formatted
- [x] Archiver name displays (fetched from users table)
- [x] Archive reason displays when provided
- [x] Section only appears for archived incidents
- [x] Build passes with no TypeScript errors

## Technical Notes

### API Enhancement
The `getIncidentById` function was enhanced to fetch archiver details separately (since no FK constraint exists):

```typescript
// In getIncidentById - separate query for archiver:
if (data.archived_by) {
  const { data: archiverData } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('id', data.archived_by)
    .single()
  if (archiverData) {
    ;(data as any).archiver = archiverData
  }
}
```

### UI Display (IncidentDetailPage.tsx)
```tsx
{/* Archive Info (if archived) */}
{incident.status === 'archived' && incident.archived_at && (
  <>
    <Divider />
    <Typography variant="subtitle2" color="text.secondary">
      ארכיון
    </Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: {...}, gap: 2 }}>
      <Box>
        <Typography variant="caption">תאריך ארכוב</Typography>
        <Typography>{format(new Date(incident.archived_at), 'dd/MM/yyyy HH:mm')}</Typography>
      </Box>
      <Box>
        <Typography variant="caption">ארכוב על ידי</Typography>
        <Typography>{archiverName}</Typography>
      </Box>
      {incident.archive_reason && (
        <Box>
          <Typography variant="caption">סיבת ארכוב</Typography>
          <Typography>{incident.archive_reason}</Typography>
        </Box>
      )}
    </Box>
  </>
)}
```

## Dependencies
- Story 6.1 (Archive Incident) - completed
- Story 6.3 (Archive Page) - completed

## File List

### Modified Files
- `safety-first/src/features/incidents/api.ts` - Added archiver fetch in getIncidentById
- `safety-first/src/features/incidents/pages/IncidentDetailPage.tsx` - Added Archive Info section

## Dev Agent Record

### Implementation Plan
1. Enhance getIncidentById to fetch archiver user data
2. Add Archive Info section to IncidentDetailPage
3. Display archive date, archiver name, and optional reason

### Debug Log
- Initial implementation tried to use FK join `archiver:users!incidents_archived_by_fkey` but this FK doesn't exist in database
- Fixed by using separate query to fetch archiver by ID

### Completion Notes
Implementation complete. Archive audit information now displays on archived incident detail pages:
- Archive date formatted as dd/MM/yyyy HH:mm
- Archiver name fetched via separate query (FK workaround)
- Archive reason displayed conditionally when provided
- Section only visible for archived incidents

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-10 | Story created | Claude Agent |
| 2026-01-10 | Implementation complete - archive audit display added | Claude Agent |
