-- Safety First Database Schema
-- Generated: 2025-12-30
-- Description: Initial schema with users, incidents, plant_locations, and daily_report_counts tables

-- ============================================================================
-- EXTENSIONS: Ensure required extensions are enabled
-- ============================================================================

-- Note: gen_random_uuid() is built-in to PostgreSQL 13+, but we enable
-- pgcrypto extension for backwards compatibility and additional crypto functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE: users
-- Purpose: Store manager/admin accounts ONLY (~10-15 users, NOT all employees)
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: plant_locations
-- Purpose: Predefined list of plant areas for incident reporting
-- ============================================================================
CREATE TABLE plant_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_he TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: incidents
-- Purpose: Store all incident reports (anonymous + named)
-- ============================================================================
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

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: daily_report_counts
-- Purpose: Track daily incident submissions for rate limiting
-- ============================================================================
CREATE TABLE daily_report_counts (
  date DATE PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES: Performance optimization
-- ============================================================================

-- Incidents table indexes
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_location_id ON incidents(location_id);

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- ROW LEVEL SECURITY: Enable RLS on all tables
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_counts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: Users table
-- ============================================================================

-- IT Admins can manage all users
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

-- ============================================================================
-- RLS POLICIES: Incidents table
-- ============================================================================

-- Public (anonymous) users can INSERT incidents
CREATE POLICY "Anyone can submit incidents"
  ON incidents
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can also INSERT incidents
CREATE POLICY "Authenticated users can submit incidents"
  ON incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can SELECT incidents they're assigned to OR if they have elevated role
CREATE POLICY "Users can view assigned incidents"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR auth.jwt() -> 'user_metadata' ->> 'role' IN ('safety_officer', 'plant_manager', 'it_admin')
  );

-- Managers can UPDATE their assigned incidents
CREATE POLICY "Managers can update assigned incidents"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR auth.jwt() -> 'user_metadata' ->> 'role' IN ('safety_officer', 'it_admin')
  );

-- Safety Officers and IT Admins can DELETE incidents
CREATE POLICY "Safety officers can delete incidents"
  ON incidents
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('safety_officer', 'it_admin')
  );

-- ============================================================================
-- RLS POLICIES: Plant Locations table
-- ============================================================================

-- Anyone (including anonymous) can SELECT active plant locations
CREATE POLICY "Anyone can view active locations"
  ON plant_locations
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Only IT Admins can manage plant locations
CREATE POLICY "IT admins can manage locations"
  ON plant_locations
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'it_admin'
  );

-- ============================================================================
-- RLS POLICIES: Daily Report Counts table
-- ============================================================================

-- Anyone can SELECT to check current daily count
CREATE POLICY "Anyone can check daily count"
  ON daily_report_counts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can INSERT/UPDATE daily counts (for system operations)
CREATE POLICY "System can update count"
  ON daily_report_counts
  FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- SEED DATA: Plant Locations
-- ============================================================================

INSERT INTO plant_locations (name, name_he, is_active) VALUES
  ('Production Line 1', 'קו ייצור 1', true),
  ('Production Line 2', 'קו ייצור 2', true),
  ('Production Line 3', 'קו ייצור 3', true),
  ('Warehouse', 'מחסן', true),
  ('Loading Dock', 'רציף הטעינה', true),
  ('Office Area', 'אזור משרדים', true),
  ('Break Room', 'חדר הפסקות', true),
  ('Parking Lot', 'חניה', true);

-- ============================================================================
-- SCHEMA NOTES
-- ============================================================================
--
-- Critical Design Decisions:
-- 1. reporter_name is TEXT (NOT foreign key) to support anonymous reporting
-- 2. When is_anonymous = true, reporter_name MUST be NULL
-- 3. Only managers/admins (~10-15) have user accounts, not all employees (~50)
-- 4. RLS enforces security at database level - NEVER disable in production
-- 5. All timestamps use TIMESTAMPTZ for proper timezone handling
-- 6. Israeli date format: DD/MM/YYYY (not MM/DD/YYYY)
--
-- Status values: 'new', 'assigned', 'resolved'
-- Severity values: 'unknown', 'near-miss', 'minor', 'major', 'critical'
-- Roles: 'manager', 'safety_officer', 'plant_manager', 'it_admin'
