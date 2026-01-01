# Story 1.2: Supabase Project and Database Schema

Status: review

---

## Story

**As a** developer,
**I want** the Supabase project configured with the database schema,
**So that** the application has data persistence for users, incidents, and locations.

---

## Acceptance Criteria

### AC1: Supabase Project Created
**Given** a Supabase account exists
**When** I create a new project for Safety First
**Then** the project is provisioned and accessible
**And** I have the project URL and anon key

### AC2: Database Tables Created
**Given** the Supabase project is ready
**When** I run the database migrations
**Then** the `users` table exists with correct schema
**And** the `incidents` table exists with correct schema
**And** the `plant_locations` table exists with correct schema
**And** the `daily_report_counts` table exists with correct schema

### AC3: Row Level Security (RLS) Enabled
**Given** all tables are created
**When** I check RLS status
**Then** RLS is enabled on `users` table
**And** RLS is enabled on `incidents` table
**And** RLS is enabled on `plant_locations` table
**And** RLS is enabled on `daily_report_counts` table

### AC4: RLS Policies Implemented
**Given** RLS is enabled on all tables
**When** I check the RLS policies
**Then** public users can INSERT into `incidents` (anonymous reporting)
**And** authenticated users can SELECT their assigned incidents
**And** Safety Officers can SELECT/UPDATE/DELETE all incidents
**And** IT Admins can manage the `users` table

### AC5: Supabase Client Connection Tested
**Given** environment variables are configured
**When** the application connects to Supabase
**Then** the connection succeeds
**And** I can query the database
**And** RLS policies are enforced

### AC6: Seed Data for Plant Locations
**Given** the `plant_locations` table is created
**When** I run the seed script
**Then** predefined plant locations are inserted
**And** Hebrew names (name_he) are populated

---

## Tasks / Subtasks

- [x] **Task 1: Create Supabase Project** (AC: 1)
  - [x] Sign up for Supabase account (if needed)
  - [x] Create new project "Safety First"
  - [x] Wait for project provisioning (~2 minutes)
  - [x] Copy Project URL and anon key
  - [x] Update `.env.local` with actual credentials

- [x] **Task 2: Setup Supabase CLI and Migrations** (AC: 2)
  - [x] Install Supabase CLI globally
  - [x] Initialize Supabase in project: `supabase init`
  - [x] Create migration file: `supabase migration new init_schema`
  - [x] Verify `supabase/migrations/` directory created

- [x] **Task 3: Create Database Schema** (AC: 2)
  - [x] Write migration SQL for `users` table
  - [x] Write migration SQL for `incidents` table
  - [x] Write migration SQL for `plant_locations` table
  - [x] Write migration SQL for `daily_report_counts` table
  - [x] Add indexes for performance

- [x] **Task 4: Enable Row Level Security** (AC: 3)
  - [x] Enable RLS on `users` table
  - [x] Enable RLS on `incidents` table
  - [x] Enable RLS on `plant_locations` table
  - [x] Enable RLS on `daily_report_counts` table

- [x] **Task 5: Implement RLS Policies** (AC: 4)
  - [x] Create policy: Public can INSERT incidents
  - [x] Create policy: Users can SELECT own assigned incidents
  - [x] Create policy: Safety Officers have full access to incidents
  - [x] Create policy: IT Admins can manage users table
  - [x] Create policy: Authenticated users can SELECT plant_locations

- [x] **Task 6: Run Migrations and Test Connection** (AC: 5, 6)
  - [x] Push migration to Supabase: `supabase db push`
  - [x] Verify tables exist in Supabase dashboard
  - [x] Insert seed data for plant_locations
  - [x] Test Supabase client connection from React app
  - [x] Test RLS policies with anonymous and authenticated queries

---

## Dev Notes

### Critical Architecture Requirements

**MUST FOLLOW THESE DATABASE RULES:**

1. **Database Naming Conventions** (from project-context.md):
   - Tables: lowercase, plural, snake_case (`incidents`, `users`, `plant_locations`)
   - Columns: lowercase, snake_case (`created_at`, `is_anonymous`, `reporter_name`)
   - Booleans: `is_` or `has_` prefix (`is_active`, `is_anonymous`)
   - Timestamps: `_at` suffix (`created_at`, `updated_at`, `resolved_at`)
   - Foreign keys: `referenced_table_id` (`location_id`, `assigned_to`)

2. **Anonymous Reporting Critical Rules**:
   - `reporter_name` is TEXT field (NOT a foreign key to users)
   - When `is_anonymous = true`, `reporter_name` MUST be NULL
   - NEVER log IP address or any identifying info for anonymous reports
   - Production line employees (~50) do NOT have user accounts
   - Only managers/admins (~10-15) have accounts in `users` table

3. **Row Level Security (RLS) Architecture**:
   - RLS enforces security at database level
   - Public users (anon) can INSERT incidents only
   - Authenticated users have role-based access
   - NEVER disable RLS in production

### Database Schema Details

#### Table: `users`

**Purpose:** Store manager/admin accounts ONLY (~10-15 users, NOT all 50 employees)

**Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Roles:**
- `manager` - Can view/resolve assigned incidents
- `safety_officer` - Can view/manage ALL incidents
- `plant_manager` - Read-only access to all incidents
- `it_admin` - Full user management access

**Key Points:**
- `id` references Supabase `auth.users(id)` (built-in auth)
- Only authenticated roles here - no "reporter" role
- Must add trigger for `updated_at`

---

#### Table: `incidents`

**Purpose:** Store all incident reports (anonymous + named)

**Schema:**
```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  severity TEXT NOT NULL DEFAULT 'unknown',
  location_id UUID REFERENCES plant_locations(id),
  incident_date TIMESTAMPTZ,
  description TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Values:**
- `new` - Just reported, not assigned
- `assigned` - Assigned to a manager
- `resolved` - Completed with resolution notes

**Severity Values:**
- `unknown` (default)
- `near-miss`
- `minor`
- `major`
- `critical`

**Key Points:**
- `reporter_name` is TEXT (nullable) - NOT a foreign key
- `is_anonymous = true` means `reporter_name` is NULL
- `location_id` references `plant_locations` (required)
- `assigned_to` references `users` (nullable until assigned)
- `photo_url` points to Supabase Storage (Story 2.6)

---

#### Table: `plant_locations`

**Purpose:** Predefined list of plant areas for incident reporting

**Schema:**
```sql
CREATE TABLE plant_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_he TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data:**
```sql
INSERT INTO plant_locations (name, name_he, is_active) VALUES
  ('Production Line 1', 'קו ייצור 1', true),
  ('Production Line 2', 'קו ייצור 2', true),
  ('Production Line 3', 'קו ייצור 3', true),
  ('Warehouse', 'מחסן', true),
  ('Loading Dock', 'רציף הטעינה', true),
  ('Office Area', 'אזור משרדים', true),
  ('Break Room', 'חדר הפסקות', true),
  ('Parking Lot', 'חניה', true);
```

**Key Points:**
- Both English (`name`) and Hebrew (`name_he`) names
- `is_active` allows soft-deleting locations
- Displayed in dropdowns as `name_he` (Hebrew UI)

---

#### Table: `daily_report_counts`

**Purpose:** Track daily incident submissions for rate limiting (FR9a)

**Schema:**
```sql
CREATE TABLE daily_report_counts (
  date DATE PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Usage:**
- Incremented on each successful incident INSERT
- Checked before allowing new submission
- Limit: 15 reports/day (configurable via `VITE_DAILY_REPORT_LIMIT`)
- Resets automatically at midnight

---

### Row Level Security (RLS) Policies

**Critical: RLS must be ENABLED on all tables before creating policies**

#### Incidents Table Policies

```sql
-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (anonymous reporting)
CREATE POLICY "Anyone can submit incidents"
  ON incidents
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can SELECT assigned incidents
CREATE POLICY "Users can view assigned incidents"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR auth.jwt() -> 'user_metadata' ->> 'role' IN ('safety_officer', 'plant_manager', 'it_admin')
  );

-- Safety Officers can UPDATE/DELETE all incidents
CREATE POLICY "Safety officers can manage incidents"
  ON incidents
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'safety_officer'
  );
```

#### Users Table Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- IT Admins can manage users
CREATE POLICY "IT admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'it_admin'
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
```

#### Plant Locations Table Policies

```sql
-- Enable RLS
ALTER TABLE plant_locations ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can SELECT active locations
CREATE POLICY "Anyone can view active locations"
  ON plant_locations
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
```

#### Daily Report Counts Table Policies

```sql
-- Enable RLS
ALTER TABLE daily_report_counts ENABLE ROW LEVEL SECURITY;

-- Anyone can SELECT (to check current count)
CREATE POLICY "Anyone can check daily count"
  ON daily_report_counts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- System/authenticated can INSERT/UPDATE
CREATE POLICY "System can update count"
  ON daily_report_counts
  FOR ALL
  TO authenticated
  USING (true);
```

---

### Indexes for Performance

```sql
-- Incidents table indexes
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_location_id ON incidents(location_id);

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### Triggers for Updated_At

```sql
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to incidents table
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Supabase CLI Commands

**Install CLI:**
```bash
npm install -g supabase
```

**Initialize Supabase in Project:**
```bash
cd safety-first
supabase init
```

**Create Migration:**
```bash
supabase migration new init_schema
```

This creates: `supabase/migrations/20231229120000_init_schema.sql`

**Write Migration SQL:**
Edit the generated file with all CREATE TABLE, ALTER TABLE, CREATE POLICY statements

**Push to Supabase:**
```bash
supabase db push
```

**Check Migration Status:**
```bash
supabase db diff
```

---

### Environment Variables Update

After creating Supabase project, update `.env.local`:

```bash
# Get from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (actual key)

# Application config
VITE_DAILY_REPORT_LIMIT=15
```

**DO NOT commit `.env.local`** - it's already in .gitignore

---

### Testing This Story

**Manual Tests:**

1. **Supabase Project Exists:**
   - Login to https://app.supabase.com
   - See "Safety First" project
   - Can access Table Editor

2. **Tables Created:**
   - Navigate to Table Editor in Supabase dashboard
   - Verify all 4 tables exist
   - Check column names and types

3. **RLS Enabled:**
   - Click each table → RLS tab
   - Should show "RLS Enabled"
   - Should list policies

4. **Connection Test from React:**
   ```typescript
   // In a React component or test file
   import { supabase } from '@/lib/supabase'

   const testConnection = async () => {
     const { data, error } = await supabase
       .from('plant_locations')
       .select('*')

     console.log('Locations:', data)
     console.log('Error:', error)
   }
   ```

5. **Seed Data Verification:**
   - Query `plant_locations` table
   - Should have 8 locations with Hebrew names

6. **RLS Policy Test:**
   ```typescript
   // Test anonymous INSERT
   const { error } = await supabase
     .from('incidents')
     .insert({
       severity: 'unknown',
       location_id: '<some-location-id>',
       is_anonymous: true
     })

   // Should succeed (no auth needed)
   ```

**Definition of Done Checklist:**
- [x] Supabase project created and accessible
- [x] `.env.local` updated with real credentials
- [x] Migration file created in `supabase/migrations/`
- [x] All 4 tables created with correct schema
- [x] RLS enabled on all 4 tables
- [x] RLS policies implemented and tested
- [x] Indexes created for performance
- [x] `updated_at` triggers working
- [x] Seed data inserted for plant_locations
- [x] Connection test successful from React app
- [x] Anonymous INSERT test passes
- [x] Authenticated query test passes

---

### Common Pitfalls to Avoid

❌ **DON'T:**
- Use camelCase for database columns (use snake_case)
- Make `reporter_name` a foreign key (it's TEXT)
- Forget to enable RLS before creating policies
- Skip the `updated_at` triggers
- Hardcode Supabase URL/key in code
- Disable RLS for "testing" and forget to re-enable
- Use American date formats (MM/DD/YYYY)

✅ **DO:**
- Follow snake_case naming strictly
- Enable RLS on every table
- Test policies with both anon and authenticated users
- Use environment variables for credentials
- Verify RLS policies in Supabase dashboard
- Keep `reporter_name` as nullable TEXT field
- Add Hebrew names for all plant locations

---

### Next Story Context

**Story 1.3** will configure the Hebrew RTL theme and MUI styling. After Story 1.2, you should have:
- ✅ Working database with all tables
- ✅ RLS policies enforcing security
- ✅ Connection tested and verified
- ✅ Ready for UI development in future stories

---

## References

- [Source: _bmad-output/epics.md#Story 1.2]
- [Source: _bmad-output/architecture.md - Database Schema]
- [Source: _bmad-output/project-context.md - Database Naming Rules]
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Implementation Summary:**
1. Created Supabase project via dashboard (user action)
2. Initialized Supabase CLI locally using `npx supabase init`
3. Created comprehensive migration file `20251230202158_init_schema.sql` with all tables, RLS, policies, indexes, triggers, and seed data
4. Executed migration via Supabase SQL Editor (Option 2 - no CLI auth needed)
5. Applied additional permission grants for anon role
6. Tested connection and RLS policies with comprehensive test suite

**Key Decisions:**
- **CLI vs SQL Editor:** Used SQL Editor for migrations instead of CLI `supabase db push` to avoid needing CLI authentication tokens (not required for app operation)
- **Anon vs Publishable Key:** Used legacy anon key (JWT format `eyJ...`) because current `@supabase/supabase-js` v2.x requires it; publishable keys are for newer SDKs
- **RLS Policy Testing:** Discovered that `.select()` after INSERT requires SELECT permission - anonymous users can INSERT but not SELECT (by design for security)
- **Migration file location:** `supabase/migrations/20251230202158_init_schema.sql`
- **Additional migration:** `supabase/migrations/20251230203000_grant_anon_permissions.sql` for explicit anon permissions

**Testing Approach:**
- Created Node.js test scripts using `tsx` and `dotenv` to load `.env.local` in Node environment
- Verified anonymous INSERT works without `.select()`
- Confirmed RLS policies enforce security (anonymous cannot SELECT incidents)
- All 6 test scenarios passed successfully

**RLS Architecture:**
- Anonymous users: Can INSERT incidents only (cannot SELECT/UPDATE/DELETE)
- Authenticated users: Role-based access via `auth.jwt() -> 'user_metadata' ->> 'role'`
- All policies use PERMISSIVE mode (additive OR logic)
- Table-level grants required in addition to RLS policies

### Files Created/Modified

**Created Files:**
- `safety-first/.env.local` - Supabase credentials (URL + anon key)
- `safety-first/supabase/migrations/20251230202158_init_schema.sql` - Complete database schema
- `safety-first/supabase/migrations/20251230203000_grant_anon_permissions.sql` - Anon role permissions
- `safety-first/src/lib/test-supabase-connection.ts` - Comprehensive RLS test suite
- `safety-first/src/lib/test-rls-debug.ts` - Debug script for RLS issues
- `safety-first/src/lib/test-rest-api.ts` - REST API test script
- `safety-first/src/lib/verify-anon-key.ts` - Anon key verification script
- `safety-first/fix-anon-permissions.sql` - Permission fix script

**Modified Files:**
- `safety-first/package.json` - Added `tsx` and `dotenv` dev dependencies

**Supabase Dashboard Actions:**
- Created project "Safety First" (iwgbxmidvqumuxauzerv)
- Executed migrations via SQL Editor
- Applied permission grants
- Verified tables, RLS policies, and seed data

---

---

## Code Review (AI)

### Review Date
2025-12-31

### Reviewer
Secondary AI Agent (Review + Tests)

### Review Outcome
✅ **Approved with fixes applied**

### Findings and Resolutions

#### 🚨 High Severity (Resolved)
**Finding:** `fix-anon-permissions.sql` contained `GRANT SELECT ON public.incidents TO anon;`
- **Risk:** Allowed anonymous users to read incident data, exposing potential PII
- **Root cause:** Incorrect assumption that `.select()` requires SELECT grant
- **Resolution:**
  - ✅ Removed SELECT grant from `fix-anon-permissions.sql`
  - ✅ Created migration `20251231000000_revoke_anon_select.sql` to revoke if already applied
  - ✅ Updated tests to use `return=minimal` (REST) or omit `.select()` (JS client)
  - ✅ Added security documentation to clarify anonymous users can INSERT but not SELECT

#### ⚠️ Medium Severity (Resolved)
**Finding:** Missing `pgcrypto` extension declaration
- **Risk:** `gen_random_uuid()` might fail on older PostgreSQL versions
- **Resolution:** ✅ Added `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` to migration
- **Note:** PostgreSQL 13+ includes gen_random_uuid() natively, but extension ensures compatibility

**Finding:** Test expectations didn't align with secure RLS policy
- **Issue:** `test-rest-api.ts` expected `return=representation` to work for anon
- **Resolution:** ✅ Changed test to use `return=minimal` and updated expectations

#### ℹ️ Low/Info (No action needed)
**Finding:** `tsx` and `dotenv` not in devDependencies
- **Status:** ✅ Already present (lines 28, 33 in package.json) - reviewer error

### Security Model Clarified
**Anonymous users (anon role):**
- ✅ CAN: INSERT incidents (anonymous reporting)
- ❌ CANNOT: SELECT/UPDATE/DELETE incidents (privacy protection)
- ✅ CAN: SELECT plant_locations (needed for dropdown)

**Implementation:**
- Use `Prefer: return=minimal` for REST API INSERTs
- Omit `.select()` after INSERT in JavaScript client
- Never grant SELECT permission on incidents to anon role

### Files Modified (Post-Review)
- `fix-anon-permissions.sql` - Removed dangerous SELECT grant
- `supabase/migrations/20251230202158_init_schema.sql` - Added pgcrypto extension
- `supabase/migrations/20251231000000_revoke_anon_select.sql` - Revoke script (NEW)
- `src/lib/test-rest-api.ts` - Updated to use return=minimal

---

**Story Status:** review
**Epic Status:** in-progress
**Next Story:** 1.3 - Hebrew RTL Theme Configuration
