# Story 2.9: Daily Report Limit

## Story Metadata

**Story ID:** 2-9-daily-report-limit
**Epic:** Epic 2 - Incident Reporting (PUBLIC ACCESS)
**Status:** review
**Priority:** High - Protects system from abuse
**Estimated Effort:** M (2-3 hours)
**Sprint:** Sprint 2

**Dependencies:**
- Story 2.8 (Form Submission) - COMPLETED

**Blocks:**
- Epic 2 completion - final story

**Created:** 2026-01-05
**Last Updated:** 2026-01-05

---

## User Story

**As the** system,
**I want** to limit reports to 15 per day,
**So that** the system is protected from abuse.

---

## Context

### Epic Context

**Epic 2: Incident Reporting (PUBLIC ACCESS)**

Final story (9 of 9) in "Snap and Report" epic. This story implements abuse protection by limiting public report submissions to 15 per day (configurable). The limit auto-resets at midnight, allowing normal operations while preventing spam or system misuse.

**Key Design Principle:** Balance openness with protection
- **Open reporting** - Anyone can submit without login (FR1)
- **Abuse protection** - Reasonable daily limit prevents spam
- **User-friendly** - Clear Hebrew message when limit reached
- **Configurable** - Limit adjustable via environment variable
- **Auto-reset** - No manual intervention needed

### User Context

**Primary Users:** Production line employees (~50 workers)
- May need to report multiple incidents in one day
- Should not be blocked by reasonable limits
- Need clear feedback when limit reached

**Design-For Scenario:**
- Normal day: 2-5 reports submitted → all accepted
- High-activity day: 15 reports submitted → subsequent attempts blocked with message
- Next day: Count resets automatically, reporting resumes

**Edge Case:** Someone attempts to spam system
- First 15 reports accepted
- 16th attempt blocked with Hebrew message: "המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות"
- Clear guidance to contact Safety Officer

### Previous Story Learnings

**Story 2.8 - Form Submission:**
- `submitIncident` API function in `api.ts`
- `handleSubmit` function in `ReportPage.tsx`
- Error handling with Hebrew snackbar messages
- Database insert pattern established
- Form validation before submission

**Integration Points:**
- Add daily limit check BEFORE database insert
- Show limit error via existing error snackbar
- No form changes needed (already has error display)

---

## Requirements Analysis

### Functional Requirements

**FR9a:** "System pauses submissions after 15 reports/day with Hebrew message (configurable via environment variable)"
- Configurable limit: `VITE_DAILY_REPORT_LIMIT=15`
- Check count before accepting submission
- Hebrew message when limit reached
- Auto-reset at midnight

**AR7:** "Daily Limit - 15 reports/day (configurable via env var), auto-resets at midnight"
- Database table: `daily_report_counts` (date, count, updated_at)
- Count increments on each successful submission
- New date row created at midnight (auto-reset)

### Acceptance Criteria

**AC1:** Submit with count < limit → accepted
- **Given** fewer than 15 reports submitted today
- **When** I submit a report
- **Then** report is accepted
- **And** daily count increments

**AC2:** Submit at limit → blocked with message
- **Given** 15 reports submitted today
- **When** I try to submit
- **Then** submission blocked
- **And** Hebrew message: "המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות"

**AC3:** New day → count resets
- **Given** new day starts (midnight)
- **When** I try to submit
- **Then** count has reset to 0
- **And** submissions accepted again

### Definition of Done

- [x] Limit from env var: `VITE_DAILY_REPORT_LIMIT`
- [x] Check `daily_report_counts` before insert (via RPC function)
- [x] Increment count on successful insert (atomic DB function)
- [x] Block submission when count >= limit (exception raised)
- [x] Hebrew limit message displayed (implemented in API)
- [x] Count resets at midnight (date-based row implementation)
- [ ] FR9a verified (requires end-to-end testing after migration deployment)

---

## Technical Specification

### Implementation Approach

**Option 1: Database Function (RECOMMENDED)**
- Postgres function handles count check + increment atomically
- Called from `submitIncident` API
- Ensures consistency even with concurrent submissions
- Auto-reset via date-based rows

**Option 2: API-Level Check**
- Query count in TypeScript
- Check against limit
- Insert if under limit
- Race condition risk with concurrent requests

**Decision: Use Database Function (Option 1)**
- Atomic operation (no race conditions)
- Consistent with Supabase architecture
- Simpler error handling

### Files to Modify

**1. Environment Configuration**
- `.env.local` - Add `VITE_DAILY_REPORT_LIMIT=15`

**2. Database Migration**
- `supabase/migrations/[timestamp]_add_daily_limit_function.sql`
- Create Postgres function for atomic count check + increment

**3. API Function**
- `safety-first/src/features/incidents/api.ts`
- Update `submitIncident` to call database function
- Handle limit exceeded error

**4. UI Component**
- `safety-first/src/features/incidents/pages/ReportPage.tsx`
- Update error handling for limit message (already has snackbar)

---

## Tasks Breakdown

### Task 1: Add Environment Variable
**Description:** Configure daily report limit

**Steps:**
1. [x] Open `.env.local`
2. [x] Add `VITE_DAILY_REPORT_LIMIT=15`
3. [x] Add to `.env.example` with comment

**Acceptance:**
- [x] Variable defined in `.env.local`
- [x] Documented in `.env.example`
- [x] Vite can access via `import.meta.env.VITE_DAILY_REPORT_LIMIT`

---

### Task 2: Create Database Function
**Description:** Atomic count check and increment

**Steps:**
1. [x] Create migration file
2. [x] Define Postgres function `check_and_increment_daily_count()`
3. [x] Function checks today's count in `daily_report_counts`
4. [x] If count >= limit → RAISE EXCEPTION with code
5. [x] If count < limit → increment or insert row, RETURN true
6. [x] Function uses current date for row key

**Acceptance:**
- [x] Migration file created
- [x] Function checks current date count
- [x] Raises exception when limit reached
- [x] Increments count atomically
- [x] Creates new row for new dates
- [x] Returns success when under limit

---

### Task 3: Update submitIncident API
**Description:** Call database function, handle limit error

**Steps:**
1. [x] Modify `submitIncident` to call DB function before insert
2. [x] If function raises limit exception → throw specific error
3. [x] Parse exception message to detect limit error
4. [x] Throw Hebrew message for limit exceeded

**Acceptance:**
- [x] Function calls `check_and_increment_daily_count()`
- [x] Detects limit exception from database
- [x] Throws Hebrew message: "המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות"
- [x] Other errors handled normally

---

### Task 4: Testing and Verification
**Description:** Test all limit scenarios

**Testing Steps:**
1. [ ] Submit reports 1-14 → all succeed (requires DB migration deployed)
2. [ ] Submit 15th report → succeeds, count = 15 (requires DB migration deployed)
3. [ ] Submit 16th report → blocked with Hebrew message (requires DB migration deployed)
4. [ ] Verify error snackbar displays limit message (requires DB migration deployed)
5. [ ] Verify form data preserved (requires DB migration deployed)
6. [ ] Manually update date in `daily_report_counts` to yesterday (requires DB migration deployed)
7. [ ] Submit report → succeeds (new day) (requires DB migration deployed)
8. [ ] Verify new date row created with count = 1 (requires DB migration deployed)

**Database Verification:**
9. [ ] Check `daily_report_counts` table (requires DB migration deployed)
10. [ ] Verify date column = current date (requires DB migration deployed)
11. [ ] Verify count increments correctly (requires DB migration deployed)
12. [ ] Verify new date row created for new day (requires DB migration deployed)

**Acceptance:**
- [x] Code implementation complete and TypeScript compilation passes
- [ ] All limit scenarios tested (requires DB migration deployed)
- [ ] Hebrew message displayed correctly (requires DB migration deployed)
- [ ] Count increments properly (requires DB migration deployed)
- [ ] Auto-reset works (new date) (requires DB migration deployed)
- [x] No console errors in code
- [ ] FR9a requirement verified (requires end-to-end testing)

---

## Acceptance Criteria Checklist

- [ ] **AC1:** Submit with count < limit → accepted, count increments (requires DB migration deployed)
- [ ] **AC2:** Submit at limit → blocked, Hebrew message shown (requires DB migration deployed)
- [ ] **AC3:** New day → count resets, submissions resume (requires DB migration deployed)
- [x] **Environment:** `VITE_DAILY_REPORT_LIMIT` configured
- [x] **Database:** Function created and atomic
- [x] **Error Handling:** Limit message in Hebrew implemented
- [x] **Auto-Reset:** Implemented via date-based rows
- [ ] **FR9a Verified:** Daily limit working (requires end-to-end testing after DB deployment)

---

## Developer Context & Guardrails

### Critical Implementation Rules

**1. Use Database Function for Atomicity**
- Concurrent submissions need atomic count check + increment
- Avoid race conditions
- Use Postgres function with transaction

**2. Date-Based Auto-Reset**
```sql
-- Row key = date (e.g., '2026-01-05')
-- New date = new row = count starts at 0
```

**3. Hebrew Error Message**
```typescript
throw new Error('המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות')
```

**4. Preserve Existing Error Handling**
- Story 2.8 has error snackbar
- Just throw new error type
- Snackbar will display it

**5. Environment Variable Access**
```typescript
const limit = import.meta.env.VITE_DAILY_REPORT_LIMIT || '15'
```

### Database Function Pattern

```sql
CREATE OR REPLACE FUNCTION check_and_increment_daily_count()
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  daily_limit INTEGER := 15; -- Or from app_settings table
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get today's count
  SELECT count INTO current_count
  FROM daily_report_counts
  WHERE date = today_date;

  -- No row = first report today
  IF current_count IS NULL THEN
    INSERT INTO daily_report_counts (date, count)
    VALUES (today_date, 1);
    RETURN TRUE;
  END IF;

  -- Check limit
  IF current_count >= daily_limit THEN
    RAISE EXCEPTION 'DAILY_LIMIT_EXCEEDED';
  END IF;

  -- Increment count
  UPDATE daily_report_counts
  SET count = count + 1, updated_at = NOW()
  WHERE date = today_date;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### API Update Pattern

```typescript
export async function submitIncident(formData: IncidentFormData): Promise<void> {
  // 1. Check daily limit
  const { error: limitError } = await supabase
    .rpc('check_and_increment_daily_count')

  if (limitError) {
    console.error('Daily limit check failed:', limitError)

    // Check if limit exceeded
    if (limitError.message?.includes('DAILY_LIMIT_EXCEEDED')) {
      throw new Error('המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות')
    }

    // Other errors
    throw new Error('שגיאה בבדיקת מגבלת דיווחים')
  }

  // 2. Insert incident (existing code)
  const { error } = await supabase
    .from('incidents')
    .insert([{
      // ... existing fields
    }])

  if (error) {
    console.error('Failed to submit incident:', error)
    throw new Error('שגיאה בשמירת הדיווח')
  }
}
```

### Common Mistakes to Avoid

**❌ DON'T:**
- Check count in TypeScript (race conditions)
- Use separate count + insert queries (not atomic)
- Forget to handle limit exception
- Show English error message
- Reset count manually (use date-based auto-reset)

**✅ DO:**
- Use database function for atomic operation
- Check limit BEFORE inserting incident
- Throw Hebrew error message for limit
- Use date-based rows for auto-reset
- Preserve existing error handling pattern

---

## Architecture Compliance

### Database Schema

**Table:** `daily_report_counts`
- `date` DATE PRIMARY KEY
- `count` INTEGER NOT NULL DEFAULT 0
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

**Function:** `check_and_increment_daily_count()`
- Returns BOOLEAN
- Raises EXCEPTION when limit exceeded
- Atomic operation (transaction)

### Environment Configuration

```bash
# .env.local
VITE_DAILY_REPORT_LIMIT=15

# .env.example
VITE_DAILY_REPORT_LIMIT=15 # Daily report submission limit (FR9a)
```

### Code Organization

```
safety-first/
  ├── .env.local (add variable)
  ├── .env.example (document variable)
  ├── src/features/incidents/
  │   └── api.ts (update submitIncident)
  └── supabase/migrations/
      └── [timestamp]_add_daily_limit_function.sql (new)
```

---

## Testing Strategy

### Manual Testing

**Scenario 1: Normal Day (< 15 reports)**
1. Submit 10 reports → all succeed
2. Check `daily_report_counts` → count = 10

**Scenario 2: Reach Limit**
1. Submit reports until count = 14
2. Submit 15th report → succeeds
3. Submit 16th report → blocked
4. See Hebrew message in red snackbar
5. Verify form data preserved

**Scenario 3: Limit Message**
1. Reach limit (15 reports)
2. Try to submit
3. See: "המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות"
4. Error snackbar is red, requires manual dismiss

**Scenario 4: Auto-Reset (Midnight)**
1. Reach limit today
2. Manually update `daily_report_counts.date` to yesterday
3. Submit report → succeeds
4. Check database → new row with today's date, count = 1

**Scenario 5: Concurrent Submissions**
1. Open two browser tabs
2. Submit from both simultaneously
3. Both should succeed if under limit
4. Count should increment correctly (no duplicate counts)

### Database Verification

```sql
-- Check today's count
SELECT * FROM daily_report_counts WHERE date = CURRENT_DATE;

-- Check function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'check_and_increment_daily_count';

-- Test function directly
SELECT check_and_increment_daily_count();
```

---

## References

### Project Artifacts

- **Epic:** `_bmad-output/epics.md` (lines 677-708)
- **Architecture:** `_bmad-output/architecture.md` (AR7: Daily Limit)
- **Project Context:** `_bmad-output/project-context.md`
- **Sprint Status:** `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Code References

- **API:** `safety-first/src/features/incidents/api.ts:submitIncident` (Story 2.8)
- **Report Page:** `safety-first/src/features/incidents/pages/ReportPage.tsx` (error handling)
- **Database Schema:** `supabase/migrations/*_initial_schema.sql` (incidents, daily_report_counts)

### Related Stories

- **Story 2.8:** Form Submission ✅ COMPLETED
- **Epic 2:** All stories complete after this

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

**Implementation Summary:**
✅ Story 2.9 implementation complete - Daily Report Limit feature fully implemented with atomic database function and Hebrew error messages.

**Changes Made:**

1. **Environment Configuration** (ALREADY EXISTED)
   - `VITE_DAILY_REPORT_LIMIT=15` configured in `.env.local`
   - Documented in `.env.example` with explanatory comment

2. **Database Migration** (NEW)
   - Created `20260105000000_add_daily_limit_function.sql`
   - Table: `daily_report_counts` with date-based primary key for auto-reset
   - Function: `check_and_increment_daily_count()` with atomic operation using SELECT FOR UPDATE
   - Permission: Granted EXECUTE to anon role for public reporting
   - Includes proper error handling with `DAILY_LIMIT_EXCEEDED` exception

3. **API Layer Updates** (MODIFIED)
   - Updated `submitIncident()` in `api.ts`
   - Added RPC call to `check_and_increment_daily_count()` BEFORE incident insert
   - Detects `DAILY_LIMIT_EXCEEDED` exception and throws Hebrew message
   - Hebrew error message: "המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות"
   - Additional error message for limit check failures: "שגיאה בבדיקת מגבלת דיווחים"
   - Updated error handling catch block to preserve both new error messages

**Technical Details:**
- Atomic operation prevents race conditions with concurrent submissions
- Date-based rows auto-reset count at midnight (no cron jobs needed)
- Existing error snackbar in ReportPage will display limit message
- No UI changes required - error flows through existing error handling

**Verification:**
- ✅ TypeScript compilation passes (no errors)
- ✅ Test suite: 27 passed (1 pre-existing failure unrelated to changes)
- ✅ No regressions introduced
- ⏳ End-to-end testing requires database migration deployment

**Next Steps:**
1. Deploy migration to Supabase database (via dashboard or CLI)
2. Verify database function with `SELECT check_and_increment_daily_count();`
3. Test limit scenarios: submit 15 reports, verify 16th is blocked
4. Confirm Hebrew message displays in error snackbar
5. Test auto-reset by changing date in database

**Token Efficiency:**
Implementation completed using ~13,000 tokens with focused, efficient approach.

**Update: Environment Variable Support Added**
- Database function now accepts `p_daily_limit` parameter (defaults to 15)
- API passes limit from `VITE_DAILY_REPORT_LIMIT` environment variable
- Testing: Change `.env.local`, restart dev server, limit updates immediately
- No breaking changes: DEFAULT 15 preserves backward compatibility

### File List

**Files Modified:**
- `safety-first/src/features/incidents/api.ts` - Updated submitIncident() with daily limit check (17 lines added)

**Files Created:**
- `safety-first/supabase/migrations/20260105000000_add_daily_limit_function.sql` - Database migration with table and function (52 lines)

**Files Already Configured:**
- `safety-first/.env.local` - VITE_DAILY_REPORT_LIMIT already set
- `safety-first/.env.example` - Already documented

---

**🎯 Story 2.9 Ready for Implementation!**

This is the final story in Epic 2 - completes public incident reporting with abuse protection!
