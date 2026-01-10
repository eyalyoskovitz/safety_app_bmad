---
story_id: '6.3'
epic_id: '6'
epic_name: 'Incident Archiving'
title: 'Archive Page'
status: 'done'
created: '2026-01-10'
---

# Story 6.3: Archive Page

## Epic Context

**Epic 6: Incident Archiving**
**Goal:** IT Admin can archive incidents and view archived incidents in a dedicated page

**User Outcome:** All authenticated users can view archived incidents in a dedicated Archive page accessible from the bottom navigation

**FRs Covered:** New functionality (not in original PRD)

## Story

**As an** authenticated user,
**I want** to view archived incidents in a dedicated page,
**So that** I can see which incidents have been archived and access their details.

## Acceptance Criteria

### AC1: Archive Tab in Bottom Navigation
- **Given** I am logged in as any authenticated user
  **When** I view the bottom navigation
  **Then** I see an "ארכיון" (Archive) tab with an Archive icon
  **And** the tab is positioned between "רשימה" (List) and "משתמשים" (Users)

### AC2: Archive Page Access
- **Given** I tap on the "ארכיון" tab
  **When** the navigation completes
  **Then** I am taken to the Archive page at `/manage/archive`
  **And** I see a list of archived incidents

### AC3: Archive List Display
- **Given** I am on the Archive page
  **When** the page loads
  **Then** I see all archived incidents displayed as cards
  **And** each card shows: severity (colored indicator), location, date, status chip ("בארכיון")
  **And** the list is sorted by archived date (newest first)

### AC4: Navigate to Archived Incident Detail
- **Given** I am on the Archive page
  **When** I tap on an archived incident card
  **Then** I navigate to the incident detail page
  **And** I see the archived incident details with the "שחזור" (Restore) button (if IT Admin)

### AC5: Empty State
- **Given** there are no archived incidents
  **When** I view the Archive page
  **Then** I see a friendly empty state message: "אין אירועים בארכיון"

## Tasks/Subtasks

- [x] Add getArchivedIncidents API function in api.ts
- [x] Create useArchivedIncidents hook
- [x] Create ArchiveListPage component
- [x] Add Archive tab to BottomNav (for all authenticated users)
- [x] Add route for /manage/archive
- [x] Test build passes

## Definition of Done

- [x] getArchivedIncidents API function added
- [x] ArchiveListPage component created with incident cards
- [x] Archive tab added to bottom navigation
- [x] Route /manage/archive configured
- [x] Empty state displayed when no archived incidents
- [x] Clicking archived incident navigates to detail page
- [x] Build passes with no TypeScript errors

## Technical Notes

### API Function
```typescript
export async function getArchivedIncidents(): Promise<Incident[]> {
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
    .eq('status', 'archived')
    .order('archived_at', { ascending: false })

  if (error) throw error
  return data || []
}
```

### Navigation Tab Order
1. רשימה (List) - index 0
2. ארכיון (Archive) - index 1 (new)
3. משתמשים (Users) - index 2 (IT Admin only)

## Dependencies
- Story 6.1 (Archive Incident) - completed
- Story 6.2 (Restore Incident) - completed

## File List

### New Files
- `safety-first/src/features/incidents/pages/ArchiveListPage.tsx`
- `safety-first/src/features/incidents/hooks/useArchivedIncidents.ts`

### Modified Files
- `safety-first/src/features/incidents/api.ts` - Add getArchivedIncidents function
- `safety-first/src/components/layout/BottomNav.tsx` - Add Archive tab
- `safety-first/src/routes/index.tsx` - Add /manage/archive route

## Dev Agent Record

### Implementation Plan
1. Add getArchivedIncidents API function in api.ts
2. Create useArchivedIncidents hook following useIncidents pattern
3. Create ArchiveListPage component following IncidentListPage pattern
4. Add Archive tab to BottomNav between List and Users
5. Add route for /manage/archive in routes/index.tsx
6. Update EmptyState component with 'no-archived' variant

### Debug Log
- Build passes with no TypeScript errors

### Completion Notes
Implementation complete. All changes implemented:
- `getArchivedIncidents()` function added to api.ts - queries incidents with status='archived', ordered by archived_at DESC
- `useArchivedIncidents` hook created following existing hook pattern
- `ArchiveListPage` component created - simplified version of IncidentListPage without filters
- "ארכיון" (Archive) tab added to BottomNav with ArchiveIcon, positioned at index 1
- Navigation logic updated: List=0, Archive=1, Users=2 (IT Admin only)
- Route `/manage/archive` added to routes/index.tsx
- EmptyState component extended with 'no-archived' variant showing "אין אירועים בארכיון"

The Archive page allows all authenticated users to view archived incidents and navigate to their details. IT Admins can restore archived incidents from the detail page.

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-10 | Story created | Claude Agent |
| 2026-01-10 | Implementation complete - all frontend changes | Claude Agent |
