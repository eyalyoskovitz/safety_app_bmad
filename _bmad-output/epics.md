---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/prd.md
  - _bmad-output/architecture.md
  - _bmad-output/ux-design-specification.md
workflowType: 'epics-and-stories'
lastStep: 3
project_name: 'safety_app_bmad'
user_name: 'Eyaly'
date: '2025-12-28'
status: 'complete'
completedAt: '2025-12-28'
---

# Safety First - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Safety First, decomposing the requirements from the PRD, Architecture, and UX Design into implementable stories with acceptance criteria and Definition of Done.

## Requirements Inventory

### Functional Requirements

**Incident Reporting (FR1-FR9, FR9a-9b) - PUBLIC ACCESS, NO LOGIN:**
- FR1: Anyone with the application URL can submit a safety incident report from a mobile device or computer **without logging in**
- FR2: Reporter can select incident severity level (unknown, near-miss, minor, major, critical) with unknown as default
- FR3: Reporter can select incident location from a predefined list of plant areas
- FR4: Reporter can enter the date and time when the incident occurred
- FR5: Reporter can provide a text description of the incident
- FR6: Reporter can attach a photo to the incident report
- FR7: Reporter can optionally enter their name in a text field (leaving blank = anonymous)
- FR8: [Merged into FR7 - simplified to optional name field]
- FR9: System confirms successful report submission to the reporter
- FR9a: System pauses submissions after 15 reports/day with Hebrew message (configurable via environment variable)

**Incident Management - Safety Officer (FR10-FR18) - LOGIN REQUIRED:**
- FR10: Safety Officer can view a list of all reported incidents
- FR11: Safety Officer can sort the incident list by date (newest/oldest)
- FR12: Safety Officer can view full details of any incident including photo
- FR13: Safety Officer can see the current status of each incident (new, assigned, resolved)
- FR14: Safety Officer can assign an incident to a responsible manager
- FR15: [REMOVED - out of MVP scope]
- FR16: [REMOVED - out of MVP scope]
- FR17: Safety Officer can view which incidents are pending assignment
- FR18: Safety Officer can view which incidents have been assigned but not resolved

**Incident Resolution - Responder (FR19-FR23) - LOGIN REQUIRED:**
- FR19: Assigned manager can view incidents assigned to them
- FR20: Assigned manager can view full incident details including photo and assignment info
- FR21: Assigned manager can mark an incident as resolved
- FR22: Assigned manager can add resolution notes explaining what was done
- FR23: Assigned manager can view their resolution history

**User Management - IT Admin (FR24-FR28) - LOGIN REQUIRED:**
- FR24: IT Admin can add new manager/admin users to the system (not production line employees)
- FR25: IT Admin can assign roles to users (Manager, Safety Officer, Plant Manager, IT Admin)
- FR26: IT Admin can remove users from the system
- FR27: IT Admin can view list of all users and their roles
- FR28: IT Admin can reset user passwords if needed

**Note:** User management is for authenticated roles only (~10-15 manager/admin accounts). Production line employees (~50) do not need accounts—they use public reporting.

**Authentication & Access (FR29-FR36):**
- FR29: Manager and admin users can log in to the system with their credentials
- FR30: System restricts management features based on authenticated user role
- FR31: Anyone (authenticated or not) can submit incident reports via the public reporting form
- FR32: [REMOVED - reporters do not have accounts, cannot view history without login]
- FR33: Managers (authenticated) can view/resolve incidents assigned to them
- FR34: Safety Officer (authenticated) can view/manage all incidents
- FR35: Plant Manager (authenticated) can view all incidents and their statuses (read-only)
- FR36: IT Admin (authenticated) can access user management functions

**Data Display & Interface (FR37-FR41):**
- FR37: System displays all text in Hebrew with right-to-left layout
- FR38: System displays dates in DD/MM/YYYY format
- FR39: System provides touch-friendly interface for mobile devices
- FR40: System shows visual indicator for incident severity levels
- FR41: System shows visual indicator for incident status

### Non-Functional Requirements

**Performance:**
- NFR-P1: Page load time < 3 seconds on 3G mobile network
- NFR-P2: Time to interactive < 5 seconds
- NFR-P3: Form submission response < 2 seconds
- NFR-P4: Photo upload completes in background; form submittable without waiting
- NFR-P5: Incident list load < 2 seconds for Safety Officer
- NFR-P6: Support 10 simultaneous users

**Security:**
- NFR-S1: All users must authenticate before accessing the system
- NFR-S2: Passwords stored using industry-standard hashing (bcrypt or similar)
- NFR-S3: Sessions expire after 24 hours of inactivity
- NFR-S4: Anonymous reports must not store or log any identifying information about the reporter
- NFR-S5: All data transmitted over HTTPS
- NFR-S6: Users can only access data and functions permitted by their role
- NFR-S7: Photos stored securely; only accessible to authorized roles

**Reliability:**
- NFR-R1: 99% uptime (allows ~7 hours downtime/month)
- NFR-R2: Planned downtime during nights/weekends acceptable
- NFR-R3: No incident data loss
- NFR-R4: If photo upload fails, report can still be submitted
- NFR-R5: Clear Hebrew error messages when something fails

**Maintainability:**
- NFR-M1: Clean, documented code for future maintenance
- NFR-M2: Simple deployment process (single developer can deploy)
- NFR-M3: Plant locations configurable without code changes
- NFR-M4: Basic logging for troubleshooting (no sensitive data in logs)

### Additional Requirements

**From Architecture:**
- AR1: **Starter Template** - Use Vite + React 18 + TypeScript with MUI and Supabase (Epic 1 Story 1)
- AR2: State management via React Context (sufficient for ~50 users)
- AR3: Feature-based folder structure (auth, incidents, users)
- AR4: Supabase Row Level Security (RLS) for authenticated management features
- AR5: **Public Access** - Incident reporting via public URL, no authentication required
- AR6: **Reporter Name as TEXT** - reporter_name field (not FK to users), null for anonymous
- AR7: **Daily Limit** - 15 reports/day (configurable via env var), auto-resets at midnight
- AR8: Hosting on Vercel (frontend) + Supabase Cloud (backend)
- AR9: Database schema: users (managers only ~10-15), incidents, plant_locations, daily_report_counts tables
- AR10: Follow naming conventions: snake_case for database, PascalCase for components, camelCase for functions
- AR11: Error handling with Hebrew messages via Snackbar notifications
- AR12: Date display as DD/MM/YYYY (Israeli format)

**From UX Design:**
- UX1: "Industrial Minimal" design direction - single-column, card-based, no sidebars
- UX2: **Two App Experiences** - Public (report form only) and Authenticated (management)
- UX3: **Public App** - No login screen, direct to report form, reporter name text field
- UX4: **Authenticated App** - Login page, bottom navigation with List, My Items
- UX5: 48px minimum touch targets
- UX6: Severity picker with colored icon buttons
- UX7: Status chips with semantic colors (Blue=new, Orange=assigned, Green=resolved)
- UX8: Bottom sheet for assignment workflow
- UX9: Photo-first capture experience (camera prominent)
- UX10: "Snap and Report" - complete in 60 seconds, ≤5 taps, zero required typing, NO LOGIN
- UX11: Pull-to-refresh on lists (authenticated app only)
- UX12: Green Snackbar for success (auto-dismiss 3s), Red for errors (requires dismiss)
- UX13: Name field is optional - leaving blank = anonymous (no toggle needed)
- UX14: Daily limit message in Hebrew when 15 reports/day reached

### FR Coverage Map

| FR | Epic | Description | Access |
|----|------|-------------|--------|
| FR1 | Epic 2 | Submit incident without logging in | **PUBLIC** |
| FR2 | Epic 2 | Select severity level | **PUBLIC** |
| FR3 | Epic 2 | Select location from list | **PUBLIC** |
| FR4 | Epic 2 | Enter date/time | **PUBLIC** |
| FR5 | Epic 2 | Provide description | **PUBLIC** |
| FR6 | Epic 2 | Attach photo | **PUBLIC** |
| FR7 | Epic 2 | Optional name field (blank = anonymous) | **PUBLIC** |
| FR8 | - | [Merged into FR7] | - |
| FR9 | Epic 2 | Confirm submission | **PUBLIC** |
| FR9a | Epic 2 | Daily limit (15/day, configurable) | **PUBLIC** |
| FR10 | Epic 3 | View all incidents | Auth |
| FR11 | Epic 3 | Sort by date | Auth |
| FR12 | Epic 3 | View incident details with photo | Auth |
| FR13 | Epic 3 | See incident status | Auth |
| FR14 | Epic 3 | Assign to manager | Auth |
| FR15 | - | [REMOVED - out of MVP scope] | - |
| FR16 | - | [REMOVED - out of MVP scope] | - |
| FR17 | Epic 3 | View pending assignment | Auth |
| FR18 | Epic 3 | View assigned but unresolved | Auth |
| FR19 | - | [Removed - no separate My Items view in MVP] | - |
| FR20 | Epic 4 | View full details with assignment info | Auth |
| FR21 | Epic 4 | Mark as resolved | Auth |
| FR22 | Epic 4 | Add resolution notes | Auth |
| FR23 | - | [Removed - not in MVP scope] | - |
| FR24 | Epic 5 | Add manager/admin users | Auth |
| FR25 | Epic 5 | Assign roles | Auth |
| FR26 | Epic 5 | Remove users | Auth |
| FR27 | Epic 5 | View users and roles | Auth |
| FR28 | Epic 5 | Reset passwords | Auth |
| FR29 | Epic 1 | Manager/admin login | Auth |
| FR30 | Epic 1 | Role-based access (management features) | Auth |
| FR31 | Epic 2 | Anyone can submit reports | **PUBLIC** |
| FR32 | - | [REMOVED - no reporter accounts] | - |
| FR33 | Epic 4 | Manager view/resolve assigned | Auth |
| FR34 | Epic 3 | Safety Officer manage all | Auth |
| FR35 | - | [Removed - not in MVP scope] | - |
| FR36 | Epic 5 | IT Admin user management | Auth |
| FR37 | Epic 1 | Hebrew RTL layout | All |
| FR38 | Epic 1 | DD/MM/YYYY date format | All |
| FR39 | Epic 1 | Touch-friendly interface | All |
| FR40 | Epic 2 | Severity visual indicator | **PUBLIC** |
| FR41 | Epic 3 | Status visual indicator | Auth |

## Epic List

### Epic 1: Foundation & Authentication
**Goal:** Users can securely access the application with a Hebrew RTL mobile-first interface

**User Outcome:** Managers and admins can log in, see the app shell, and navigate the application. Production line employees do NOT need to log in - they use the public reporting form (Epic 2).

**FRs Covered:** FR29, FR30, FR37, FR38, FR39

**Epic Overview:**
This epic establishes the technical foundation and authentication system for Safety First. It delivers a working application shell with Hebrew RTL support, mobile-first design, and login functionality for managers and administrators. Production line employees will NOT use authentication - they access the public reporting form (Epic 2) without logging in. This epic creates the infrastructure that all subsequent epics build upon, including the Supabase backend, MUI theme configuration, and protected route system for management features.

---

#### Story 1.1: Project Initialization

**As a** developer,
**I want** the project scaffolded with Vite, React, TypeScript, MUI, and Supabase,
**So that** I can begin building the Safety First application.

**Acceptance Criteria:**

- **Given** a new development environment
  **When** I run the project setup commands
  **Then** a Vite + React 18 + TypeScript project is created
  **And** dependencies are installed (MUI, Emotion, Supabase JS, React Router)
  **And** the folder structure follows the Architecture specification (features/auth, features/incidents, features/users)
  **And** environment variables are configured for Supabase connection (.env.local)
  **And** the app runs locally with `npm run dev`

**Definition of Done:**
- [ ] Project created with `npm create vite@latest`
- [ ] All dependencies installed and package.json correct
- [ ] Folder structure matches Architecture doc
- [ ] .env.example documents required variables
- [ ] App runs without errors on `npm run dev`
- [ ] README updated with setup instructions

---

#### Story 1.2: Supabase Project and Database Schema

**As a** developer,
**I want** the Supabase project configured with the database schema,
**So that** the application has data persistence for users, incidents, and locations.

**Acceptance Criteria:**

- **Given** a new Supabase project
  **When** I run the database migrations
  **Then** the `users` table is created (id, email, full_name, role, created_at, updated_at)
  **And** the `incidents` table is created (id, reporter_name, is_anonymous, severity, location_id, incident_date, description, photo_url, status, assigned_to, assigned_at, resolution_notes, resolved_at, created_at, updated_at)
  **And** the `plant_locations` table is created (id, name, name_he, is_active, created_at)
  **And** the `daily_report_counts` table is created (date, count, updated_at)
  **And** RLS policies allow public INSERT on incidents
  **And** RLS policies restrict SELECT/UPDATE to authenticated users

**Definition of Done:**
- [ ] Supabase project created
- [ ] Migration files created in `supabase/migrations/`
- [ ] All tables created with correct columns and types
- [ ] RLS enabled on all tables
- [ ] RLS policies implemented per Architecture doc
- [ ] Supabase client configured in `src/lib/supabase.ts`
- [ ] Connection tested successfully

---

#### Story 1.3: Hebrew RTL Theme Configuration

**As a** user,
**I want** the application to display in Hebrew with right-to-left layout,
**So that** I can read and interact with the interface naturally.

**Acceptance Criteria:**

- **Given** the application is loaded
  **When** any page is displayed
  **Then** all text renders right-to-left
  **And** the MUI theme direction is set to 'rtl'
  **And** the base font size is 16px minimum
  **And** touch targets are 48px minimum
  **And** the color palette matches UX spec (Blue primary, severity colors)

- **Given** a date value
  **When** it is displayed
  **Then** it shows in DD/MM/YYYY format (Israeli standard)

**Definition of Done:**
- [ ] MUI theme created in `src/theme/theme.ts` with RTL
- [ ] RTL cache and provider configured
- [ ] Date utility functions created (`formatDate`, `formatDateTime`)
- [ ] Theme colors match UX specification
- [ ] Touch targets configured to 48px minimum
- [ ] Theme provider wraps application in `App.tsx`
- [ ] FR37, FR38 verified

---

#### Story 1.4: App Shell with Bottom Navigation

**As a** user,
**I want** a mobile-first app layout with bottom navigation,
**So that** I can easily navigate between different sections.

**Acceptance Criteria:**

- **Given** I am logged in as a manager or admin
  **When** I view the application
  **Then** I see a bottom navigation bar with tabs (List, My Items)
  **And** the active tab is visually highlighted
  **And** tapping a tab navigates to that section
  **And** the layout is single-column with 16px margins

- **Given** I am on any authenticated page
  **When** I view the header
  **Then** I see a button/link to submit a new report
  **And** I see a logout option

**Definition of Done:**
- [ ] `AppShell` component with header and content area
- [ ] `BottomNav` component with MUI BottomNavigation
- [ ] React Router routes configured for authenticated sections
- [ ] Header with report button and logout
- [ ] Layout responsive on mobile viewport
- [ ] FR39 verified (touch-friendly)

---

#### Story 1.5: User Authentication (Login/Logout)

**As a** manager or administrator,
**I want** to log in with my email and password,
**So that** I can access the incident management features.

**Acceptance Criteria:**

- **Given** I am not logged in
  **When** I access a protected route (e.g., `/manage/incidents`)
  **Then** I am redirected to the login page

- **Given** I am on the login page
  **When** I enter valid credentials and submit
  **Then** I am authenticated and redirected to the incident list
  **And** my session persists on page refresh

- **Given** I am on the login page
  **When** I enter invalid credentials
  **Then** I see a Hebrew error message "שם משתמש או סיסמה שגויים"
  **And** I remain on the login page

- **Given** I am logged in
  **When** I tap the logout button
  **Then** my session is cleared
  **And** I am redirected to the login page

- **Given** my session has been inactive for 24 hours
  **When** I try to access a protected route
  **Then** my session is expired and I must log in again

**Definition of Done:**
- [ ] `LoginPage` component with email/password form
- [ ] `AuthContext` for session state management
- [ ] `useAuth` hook (login, logout, user, loading)
- [ ] Supabase Auth configured for email/password
- [ ] Form validation (required fields)
- [ ] Error messages in Hebrew
- [ ] Session persistence working
- [ ] FR29, NFR-S1, NFR-S3 verified

---

#### Story 1.6: Role-Based Route Protection

**As the** system,
**I want** to restrict access based on user roles,
**So that** users can only access features appropriate to their role.

**Acceptance Criteria:**

- **Given** I am not authenticated
  **When** I try to access `/manage/*` routes
  **Then** I am redirected to the login page

- **Given** I am authenticated as a Manager
  **When** I access the user management page
  **Then** I am shown an "access denied" message or redirected to my allowed area

- **Given** I am authenticated as an IT Admin
  **When** I access the user management page
  **Then** the page loads successfully

- **Given** I am authenticated with any role
  **When** I access the incident list
  **Then** the page loads (all authenticated users can view incidents per their role)

**Definition of Done:**
- [ ] `ProtectedRoute` component redirects unauthenticated users
- [ ] `RoleRoute` component checks user role against allowed roles
- [ ] Routes configured with appropriate role restrictions
- [ ] Access denied handling with Hebrew message
- [ ] Role checked from user record in database
- [ ] FR30, NFR-S6 verified

---

### Epic 2: Incident Reporting (PUBLIC ACCESS)
**Goal:** Anyone can report safety incidents from their mobile device in under 60 seconds WITHOUT logging in

**User Outcome:** Yossi opens the URL, snaps a photo, submits - no login, no password, no account needed

**FRs Covered:** FR1-FR9, FR9a, FR31, FR40

**Key Deliverables:**
- Public report form accessible without authentication
- Reporter name text field (optional - leaving blank = anonymous)
- Severity picker with colored icons (unknown, near-miss, minor, major, critical)
- Location dropdown with plant areas (managed via Supabase UI)
- Date/time selection
- Description text field (optional)
- Photo capture (camera-first on mobile) with background upload
- Submit confirmation (green snackbar)
- Daily limit (15/day, configurable) with Hebrew message when reached

**Epic Overview:**
This epic delivers the core "Snap and Report" functionality - the heart of Safety First. It creates a public-facing incident report form that anyone can access without logging in. Production line employees simply open the URL on their phone, optionally take a photo, select location and severity, and submit. The form supports both named and anonymous reporting via an optional name field. A simple daily limit (15 reports/day) protects against abuse. This epic embodies the key design principle: absolute minimum friction for reporting safety incidents.

---

#### Story 2.1: Public Report Form Page

**As a** production line employee,
**I want** to access the incident report form without logging in,
**So that** I can quickly report safety hazards without barriers.

**Acceptance Criteria:**

- **Given** I open the application URL (e.g., `/` or `/report`)
  **When** the page loads
  **Then** I see the incident report form immediately (no login screen)
  **And** the page displays in Hebrew RTL
  **And** the form is mobile-optimized with large touch targets

- **Given** I am on the report form
  **When** I view the page
  **Then** I see all form fields (location, severity, date/time, name, description, photo)
  **And** I see a prominent "שלח דיווח" (Submit Report) button

**Definition of Done:**
- [ ] `ReportPage` component accessible at public route
- [ ] No authentication check on this route
- [ ] Form renders with all fields per spec
- [ ] Mobile-first responsive layout
- [ ] Hebrew labels on all fields
- [ ] FR1, FR31 verified

---

#### Story 2.2: Location Selection

**As a** reporter,
**I want** to select the incident location from a dropdown,
**So that** I can quickly indicate where the hazard is without typing.

**Acceptance Criteria:**

- **Given** I am on the report form
  **When** I tap the location field
  **Then** I see a dropdown with predefined plant areas in Hebrew
  **And** the options load from the `plant_locations` table
  **And** only active locations are shown

- **Given** the location dropdown is open
  **When** I select a location
  **Then** the dropdown closes
  **And** my selection is displayed in the field

**Definition of Done:**
- [ ] Location dropdown using MUI Select
- [ ] Locations fetched from Supabase `plant_locations` table
- [ ] Hebrew location names displayed (`name_he`)
- [ ] Only `is_active = true` locations shown
- [ ] Touch-friendly dropdown (48px items)
- [ ] Locations managed via Supabase Table Editor (no code UI needed)
- [ ] FR3 verified

---

#### Story 2.3: Severity Selection

**As a** reporter,
**I want** to select the incident severity level,
**So that** the Safety Officer knows how urgent the issue is.

**Acceptance Criteria:**

- **Given** I am on the report form
  **When** I view the severity picker
  **Then** I see 5 options: לא ידוע (unknown), כמעט תאונה (near-miss), קל (minor), בינוני (major), חמור (critical)
  **And** each option has a distinct color (grey, blue, yellow, orange, red)
  **And** "לא ידוע" (unknown) is selected by default

- **Given** the severity picker is displayed
  **When** I tap a severity option
  **Then** that option becomes selected
  **And** the selection is visually highlighted

**Definition of Done:**
- [ ] `SeverityPicker` component with 5 colored buttons
- [ ] Icons or colors per UX spec
- [ ] Default selection is "unknown"
- [ ] Touch-friendly (48px minimum targets)
- [ ] Hebrew labels
- [ ] FR2, FR40 verified

---

#### Story 2.4: Date and Time Selection

**As a** reporter,
**I want** to enter when the incident occurred,
**So that** the timeline is accurately recorded.

**Acceptance Criteria:**

- **Given** I am on the report form
  **When** I view the date/time fields
  **Then** they default to the current date and time

- **Given** the incident happened earlier
  **When** I tap the date field
  **Then** I can select a different date
  **And** the date displays in DD/MM/YYYY format

- **Given** I need to adjust the time
  **When** I tap the time field
  **Then** I can select a different time

**Definition of Done:**
- [ ] Date picker using MUI DatePicker or native input
- [ ] Time picker using MUI TimePicker or native input
- [ ] Default to current date/time
- [ ] Date formatted as DD/MM/YYYY
- [ ] Mobile-friendly date/time selection
- [ ] FR4 verified

---

#### Story 2.5: Description Field

**As a** reporter,
**I want** to optionally add a text description,
**So that** I can provide additional context about the incident.

**Acceptance Criteria:**

- **Given** I am on the report form
  **When** I view the description field
  **Then** it is clearly marked as optional
  **And** it has a Hebrew placeholder text

- **Given** I want to add details
  **When** I tap the description field
  **Then** a text area opens for input
  **And** I can type in Hebrew (RTL)

**Definition of Done:**
- [ ] Multi-line text field using MUI TextField
- [ ] Marked as optional (לא חובה)
- [ ] RTL text input working
- [ ] Reasonable max length (500 chars)
- [ ] FR5 verified

---

#### Story 2.6: Photo Capture and Upload

**As a** reporter,
**I want** to take a photo of the hazard,
**So that** the Safety Officer can see exactly what I'm reporting.

**Acceptance Criteria:**

- **Given** I am on the report form on a mobile device
  **When** I tap the photo button
  **Then** my device camera opens directly (using `capture="environment"`)

- **Given** I am on the report form on desktop
  **When** I tap the photo button
  **Then** a file picker appears

- **Given** I have taken/selected a photo
  **When** it appears in the form
  **Then** I see a thumbnail preview
  **And** I can tap to remove it

- **Given** I submit the form with a photo
  **When** the upload starts
  **Then** the photo uploads in the background
  **And** the form submission does not wait for photo upload
  **And** the photo is stored in Supabase Storage

**Definition of Done:**
- [ ] Photo capture button (camera icon)
- [ ] Uses `capture="environment"` for camera-first on mobile
- [ ] Falls back to file picker on desktop
- [ ] Thumbnail preview after capture
- [ ] Remove photo option
- [ ] Upload to Supabase Storage
- [ ] Background upload (non-blocking)
- [ ] Photo URL saved to incident record
- [ ] FR6, NFR-P4 verified

---

#### Story 2.7: Optional Reporter Name

**As a** reporter,
**I want** to optionally enter my name,
**So that** I can identify myself or remain anonymous by leaving it blank.

**Acceptance Criteria:**

- **Given** I am on the report form
  **When** I view the name field
  **Then** I see a text field with placeholder "השם שלך (לא חובה)" (Your name - optional)
  **And** the field is clearly marked as optional

- **Given** I want to identify myself
  **When** I enter my name in the field
  **Then** my report will include my name

- **Given** I want to remain anonymous
  **When** I leave the name field blank
  **Then** my report will have `reporter_name = null`
  **And** no identifying information is stored

**Definition of Done:**
- [ ] Name text field (MUI TextField)
- [ ] Clear "optional" indication in Hebrew
- [ ] Blank field = null `reporter_name`
- [ ] No toggle needed - simplicity over explicitness
- [ ] No IP or other PII logged
- [ ] FR7 verified

---

#### Story 2.8: Form Submission and Confirmation

**As a** reporter,
**I want** to submit my report and see confirmation,
**So that** I know my report was received.

**Acceptance Criteria:**

- **Given** I have filled the required fields (location, severity)
  **When** I tap the submit button
  **Then** the report is saved to the database
  **And** I see a green success snackbar in Hebrew: "הדיווח נשלח בהצלחה"
  **And** the form resets for a new report

- **Given** the submission fails (network error)
  **When** the error occurs
  **Then** I see a red error snackbar in Hebrew
  **And** my form data is preserved
  **And** I can retry submission

- **Given** required fields are empty
  **When** I tap submit
  **Then** validation errors show inline
  **And** the form does not submit

**Definition of Done:**
- [ ] Submit button with loading state
- [ ] Insert to Supabase `incidents` table
- [ ] Success snackbar (green, auto-dismiss 3s)
- [ ] Error snackbar (red, requires dismiss)
- [ ] Form validation for required fields
- [ ] Form reset after successful submit
- [ ] Error preserves form data
- [ ] FR9 verified

---

#### Story 2.9: Daily Report Limit

**As the** system,
**I want** to limit reports to 15 per day,
**So that** the system is protected from abuse.

**Acceptance Criteria:**

- **Given** fewer than 15 reports have been submitted today
  **When** I submit a report
  **Then** the report is accepted
  **And** the daily count increments

- **Given** 15 reports have been submitted today
  **When** I try to submit a report
  **Then** the submission is blocked
  **And** I see a Hebrew message: "המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות"

- **Given** a new day starts (midnight)
  **When** I try to submit
  **Then** the count has reset to 0
  **And** I can submit reports again

**Definition of Done:**
- [ ] Limit value from environment variable (`VITE_DAILY_REPORT_LIMIT=15`)
- [ ] Check `daily_report_counts` before insert
- [ ] Increment count on successful insert
- [ ] Block submission when count >= limit
- [ ] Hebrew limit message displayed
- [ ] Count resets at midnight (new date row)
- [ ] FR9a verified

---

### Epic 3: Incident Management (Safety Officer)
**Goal:** Safety Officer can view, track, and assign all incidents during daily triage

**User Outcome:** Avi can see new incidents, assign them to managers, and track status

**FRs Covered:** FR10-FR14, FR17-FR18, FR34, FR41

**Epic Overview:**
This epic delivers the Safety Officer's daily triage workflow - the command center for incident management. Avi logs in each morning, sees new incidents clearly marked, reviews details and photos, assigns them to responsible managers, and tracks progress. The interface uses card-based lists with status indicators (Blue=new, Orange=assigned, Green=resolved) so nothing slips through the cracks. This epic transforms incident reports into actionable assignments.

---

#### Story 3.1: Incident List View

**As a** Safety Officer,
**I want** to view a list of all reported incidents,
**So that** I can see what needs attention during my daily triage.

**Acceptance Criteria:**

- **Given** I am logged in as Safety Officer
  **When** I navigate to the incident list
  **Then** I see all incidents displayed as cards
  **And** each card shows: severity (colored indicator), location, date, status chip
  **And** new incidents are clearly visible with a blue "חדש" (New) chip
  **And** the list loads in under 2 seconds

- **Given** I am viewing the incident list
  **When** I look at an incident card
  **Then** I see the status with semantic colors (Blue=new, Orange=assigned, Green=resolved)
  **And** I see the severity with appropriate color coding
  **And** I can quickly identify which incidents need action

- **Given** there are no incidents
  **When** I view the list
  **Then** I see a friendly empty state message in Hebrew

**Definition of Done:**
- [ ] `IncidentListPage` component at `/manage/incidents`
- [ ] `IncidentCard` component showing key incident info
- [ ] Status chips with semantic colors per UX spec
- [ ] Severity indicators with colors
- [ ] Empty state with icon and Hebrew message
- [ ] Pull-to-refresh functionality
- [ ] List loads < 2 seconds (NFR-P5)
- [ ] FR10, FR13, FR41 verified

---

#### Story 3.2: List Sorting and Filtering

**As a** Safety Officer,
**I want** to sort and filter the incident list,
**So that** I can quickly find incidents that need my attention.

**Acceptance Criteria:**

- **Given** I am viewing the incident list
  **When** I tap the sort control
  **Then** I can choose "חדש לישן" (newest first) or "ישן לחדש" (oldest first)
  **And** the default is newest first
  **And** the list re-sorts immediately

- **Given** I am viewing the incident list
  **When** I tap a status filter (All, New, Assigned, Resolved)
  **Then** the list shows only incidents with that status
  **And** the active filter is visually highlighted
  **And** "All" is the default selection

- **Given** I filter by "New" status
  **When** the filter applies
  **Then** I see only incidents pending assignment (FR17)

- **Given** I filter by "Assigned" status
  **When** the filter applies
  **Then** I see only incidents assigned but not resolved (FR18)

**Definition of Done:**
- [ ] Sort dropdown/toggle (newest/oldest)
- [ ] Filter chips or tabs (All, New, Assigned, Resolved)
- [ ] Default: newest first, All status
- [ ] Filters applied via Supabase query or client-side
- [ ] Active filter/sort visually indicated
- [ ] Hebrew labels on all controls
- [ ] FR11, FR13, FR17, FR18 verified

---

#### Story 3.3: Incident Detail View

**As a** Safety Officer,
**I want** to view full details of an incident including the photo,
**So that** I can understand the issue before assigning it.

**Acceptance Criteria:**

- **Given** I am viewing the incident list
  **When** I tap on an incident card
  **Then** I navigate to the incident detail page
  **And** I see the full incident information

- **Given** I am on the incident detail page
  **When** I view the details
  **Then** I see: photo (large, tappable for full view), location, severity, date/time, description, reporter name (or "אנונימי" if anonymous), status, assigned to (if assigned), resolution notes (if resolved)

- **Given** the incident has a photo
  **When** I tap the photo
  **Then** it opens in a full-screen viewer
  **And** I can zoom and pan

- **Given** the incident has no photo
  **When** I view the details
  **Then** a placeholder or "no photo" indicator is shown

**Definition of Done:**
- [ ] `IncidentDetailPage` component at `/manage/incidents/:id`
- [ ] Photo displayed prominently (hero style)
- [ ] Full-screen photo viewer on tap
- [ ] All incident fields displayed with Hebrew labels
- [ ] Anonymous reporter shown as "אנונימי"
- [ ] Status chip with semantic color
- [ ] Severity indicator with color
- [ ] Back navigation to list
- [ ] FR12 verified

---

#### Story 3.4: Incident Assignment Workflow

**As a** Safety Officer,
**I want** to assign an incident to a responsible manager,
**So that** someone takes ownership and resolves it.

**Acceptance Criteria:**

- **Given** I am on the detail page of a "New" incident
  **When** I tap the "שיוך" (Assign) button
  **Then** a bottom sheet opens with assignment options

- **Given** the assignment bottom sheet is open
  **When** I select an assignee
  **Then** the incident status changes to "Assigned"
  **And** the `assigned_to` field is set to the selected user
  **And** the `assigned_at` timestamp is set
  **And** I see a success snackbar in Hebrew: "האירוע שויך בהצלחה"
  **And** the bottom sheet closes

- **Given** the assignment fails (network error)
  **When** the error occurs
  **Then** I see a red error snackbar in Hebrew
  **And** the incident remains unassigned

- **Given** an incident is already assigned
  **When** I view the detail page
  **Then** I can reassign it to a different manager

**Definition of Done:**
- [ ] "Assign" button on incident detail (visible for new/assigned incidents)
- [ ] `AssignmentSheet` component using MUI SwipeableDrawer
- [ ] Update incident `status`, `assigned_to`, `assigned_at`
- [ ] Success/error snackbars in Hebrew
- [ ] Reassignment supported
- [ ] FR14 verified

---

### Epic 4: Incident Resolution (Responder - LOGIN REQUIRED)
**Goal:** Assigned managers can mark incidents resolved with resolution notes, reopen resolved incidents, and all users can see assignee information in list view

**User Outcome:** Dana logs in, views the incident list, sees incidents assigned to her, and marks them resolved with notes. She can reopen resolved incidents if issues recur. All users can see who incidents are assigned to and filter by assignee.

**FRs Covered:** FR20-FR22, FR33 (FR19, FR32 removed - no separate My Items view in MVP)

**Epic Overview:**
This epic delivers the resolution workflow for assigned managers. When Dana logs in, she views the same incident list as other authenticated users, can see which incidents are assigned to her, view full details including who assigned it and when, then mark it resolved with notes explaining what was done. If an issue recurs or wasn't fully addressed, she can reopen the resolved incident to reassign or re-resolve it. Story 4.4 adds assignee visibility and filtering to help all users quickly identify incidents assigned to specific managers. This epic completes the incident lifecycle from report to resolution, closing the feedback loop.

---

#### Story 4.1: Incident Detail with Assignment Info

**As a** Manager viewing an assigned incident,
**I want** to see full details including assignment information,
**So that** I understand the context and who assigned it to me.

**Acceptance Criteria:**

- **Given** I am on an incident detail page
  **When** I view an incident assigned to me
  **Then** I see all incident details (photo, location, severity, date, description)
  **And** I see who assigned it to me (Safety Officer name)
  **And** I see when it was assigned (`assigned_at` formatted)

- **Given** the incident was previously resolved
  **When** I view the details
  **Then** I also see resolution notes and resolution date

- **Given** I am a Manager viewing an incident NOT assigned to me
  **When** I access the detail page
  **Then** I can view the details
  **But** I do NOT see the Resolve button (only assignee can resolve)

**Definition of Done:**
- [ ] Assignment section on incident detail page
- [ ] Show assigner name (query from users table)
- [ ] Show assignment date/time formatted
- [ ] Resolution section (if resolved)
- [ ] Resolve button only shown to assignee
- [ ] FR20 verified

---

#### Story 4.2: Mark Incident as Resolved

**As a** Manager,
**I want** to mark an incident as resolved,
**So that** I can close the loop on safety issues I've addressed.

**Acceptance Criteria:**

- **Given** I am viewing an incident assigned to me (status = "assigned")
  **When** I tap the "סיום טיפול" (Resolve) button
  **Then** a resolution dialog/sheet opens
  **And** I can confirm resolution

- **Given** the resolution dialog is open
  **When** I confirm without notes
  **Then** the incident status changes to "resolved"
  **And** the `resolved_at` timestamp is set
  **And** I see a success snackbar: "האירוע נסגר בהצלחה"
  **And** the dialog closes

- **Given** the resolution fails (network error)
  **When** the error occurs
  **Then** I see a red error snackbar in Hebrew
  **And** the incident remains assigned

- **Given** an incident is already resolved
  **When** I view the detail page
  **Then** the Resolve button is not shown (or disabled)
  **And** I see the resolution information instead

**Definition of Done:**
- [ ] "Resolve" button on incident detail (for assignee only)
- [ ] Resolution dialog/sheet component
- [ ] Update incident `status = 'resolved'`, `resolved_at`
- [ ] Success/error snackbars in Hebrew
- [ ] Button hidden after resolution
- [ ] FR21 verified

---

#### Story 4.3: Resolution Notes

**As a** Manager,
**I want** to add notes when resolving an incident,
**So that** I can document what was done to address the safety issue.

**Acceptance Criteria:**

- **Given** the resolution dialog is open
  **When** I view the form
  **Then** I see an optional text field for resolution notes
  **And** the field has Hebrew placeholder: "מה נעשה לטיפול בבעיה? (לא חובה)"

- **Given** I enter resolution notes
  **When** I confirm resolution
  **Then** the notes are saved to `resolution_notes` field
  **And** the incident is marked resolved

- **Given** I don't enter notes
  **When** I confirm resolution
  **Then** the incident is still marked resolved
  **And** `resolution_notes` remains null

- **Given** an incident has been resolved with notes
  **When** anyone views the detail page
  **Then** the resolution notes are visible

**Definition of Done:**
- [ ] Text area in resolution dialog
- [ ] Marked as optional
- [ ] RTL text input
- [ ] Notes saved to `resolution_notes` column
- [ ] Notes displayed on resolved incident detail
- [ ] FR22 verified

---

#### Story 4.4: Assignee Visibility and Filtering

**As a** Safety Officer or Manager,
**I want** to see who incidents are assigned to in the list view and filter by assignee,
**So that** I can quickly find incidents assigned to specific managers.

**Acceptance Criteria:**

- **Given** I am viewing the incident list
  **When** I look at an incident card
  **Then** I see the assignee name displayed (if assigned)
  **And** unassigned incidents show "לא משויך" (Not assigned)

- **Given** I am viewing the incident list
  **When** I tap the assignee filter ("שיוך")
  **Then** I see a dropdown with all manager names
  **And** I see an "הכל" (All) option
  **And** I can select a specific manager

- **Given** I select a specific manager in the assignee filter
  **When** the filter is applied
  **Then** the list shows only incidents assigned to that manager
  **And** the selected manager name is highlighted in the filter

- **Given** I select "הכל" (All) in the assignee filter
  **When** the filter is applied
  **Then** the list shows all incidents regardless of assignment

**Definition of Done:**
- [ ] Assignee name displayed on incident cards in list view
- [ ] "לא משויך" shown for unassigned incidents
- [ ] Assignee filter dropdown added to IncidentListPage
- [ ] Filter populated with all manager names from users table
- [ ] Filter includes "הכל" (All) option as default
- [ ] List filters correctly by selected assignee
- [ ] Filter state persists during session
- [ ] Hebrew labels throughout

**Technical Notes:**
- Fetch users with role 'manager' or 'it_admin' for filter options
- Assignee name already available from existing joins in getIncidents()
- Add filter state to IncidentListPage alongside existing status filter
- Display assignee name on IncidentCard component (below location or status)

---

#### Story 4.5: Reopen Resolved Incident

**As a** Manager or Safety Officer,
**I want** to reopen a resolved incident,
**So that** I can reassign it if the issue wasn't fully addressed or recurred.

**Acceptance Criteria:**

- **Given** I am viewing a resolved incident detail page
  **When** I look at the action buttons area
  **Then** I see a "פתח מחדש" (Reopen) button in the position where "שיוך" was
  **And** the "שיוך" button is not visible (incident is resolved)

- **Given** I click the "פתח מחדש" button
  **When** the action completes successfully
  **Then** the incident status changes from 'resolved' back to 'assigned'
  **And** the incident remains assigned to the same user (assigned_to unchanged)
  **And** resolution details are preserved (resolved_at, resolution_notes remain in database)
  **And** I see a success snackbar: "האירוע נפתח מחדש"

- **Given** the reopen action fails (network error)
  **When** the error occurs
  **Then** I see a red error snackbar in Hebrew
  **And** the incident remains resolved

- **Given** an incident is reopened
  **When** I view the detail page
  **Then** the incident appears as 'assigned' status
  **And** I see the "שיוך" button (to reassign if needed)
  **And** I see the "סיום טיפול" button if I'm the assignee
  **And** the resolution section still shows previous resolution details for reference

**Definition of Done:**
- [ ] "פתח מחדש" button on resolved incident detail page
- [ ] Button positioned where "שיוך" button appears for assigned incidents
- [ ] New API function `reopenIncident()` updates status to 'assigned'
- [ ] Resolution details preserved (resolved_at, resolution_notes unchanged)
- [ ] assigned_to remains unchanged (stays assigned to same user)
- [ ] Success/error snackbars in Hebrew
- [ ] Incident page shows correct buttons after reopen (שיוך, סיום טיפול)
- [ ] Resolution section remains visible with historical data
- [ ] Build passes with no TypeScript errors

**Technical Notes:**
- Add `reopenIncident(incidentId: string)` to api.ts
- Update only `status = 'assigned'`, DO NOT modify resolved_at or resolution_notes
- Add reopen button similar to assign button styling
- Button visible to all authenticated users (not just assignee)
- Keep resolution section visible after reopen for historical reference
- No confirmation dialog needed (simple one-click action)

---

### Epic 5: User Management (IT Admin - LOGIN REQUIRED)
**Goal:** IT Admin can manage manager/admin user accounts

**User Outcome:** Moshe can add new managers, assign roles, and handle password resets (~10-15 users, not all 50 employees)

**FRs Covered:** FR24-FR28, FR36

**Epic Overview:**
This epic provides IT Admin capabilities to manage the small set of authenticated users (~10-15 manager/admin accounts). Moshe can add new managers when someone joins the team, assign or change their roles (Manager, Safety Officer, Plant Manager, IT Admin), remove users who leave, and reset forgotten passwords. This is intentionally simple - no complex user provisioning, no employee self-service. Production line employees use public reporting and don't need accounts.

**Note:** Production line employees do not need accounts. They use public reporting.

---

#### Story 5.1: User List View

**As an** IT Admin,
**I want** to view all users and their roles,
**So that** I can see who has access to the system.

**Acceptance Criteria:**

- **Given** I am logged in as IT Admin
  **When** I navigate to User Management
  **Then** I see a list of all users
  **And** each user shows: name, email, role
  **And** the list is sorted alphabetically by name

- **Given** I am viewing the user list
  **When** I look at a user entry
  **Then** I can see their role displayed as a chip/badge
  **And** I can identify IT Admins, Safety Officers, Plant Managers, and Managers

- **Given** I am NOT an IT Admin
  **When** I try to access User Management
  **Then** I am shown an access denied message or the menu item is hidden

**Definition of Done:**
- [ ] User Management menu item (visible only to IT Admin)
- [ ] `UserListPage` component at `/manage/users`
- [ ] Query all users from database
- [ ] Display name, email, role for each user
- [ ] Role shown as colored chip
- [ ] Access restricted to IT Admin role
- [ ] FR27, FR36 verified

---

#### Story 5.2: Add New User

**As an** IT Admin,
**I want** to add new manager/admin users,
**So that** new team members can access the system.

**Acceptance Criteria:**

- **Given** I am on the User Management page
  **When** I tap "הוסף משתמש" (Add User)
  **Then** a form opens for new user creation

- **Given** I am filling the add user form
  **When** I enter: email, full name, role, initial password
  **Then** I can submit the form

- **Given** I submit a valid new user
  **When** the creation succeeds
  **Then** the user is added to the database
  **And** the user is created in Supabase Auth
  **And** I see a success snackbar: "המשתמש נוסף בהצלחה"
  **And** the new user appears in the list

- **Given** I try to add a user with an existing email
  **When** I submit
  **Then** I see an error: "כתובת האימייל כבר קיימת במערכת"

**Definition of Done:**
- [ ] "Add User" button on user list
- [ ] Add user form (email, name, role, password)
- [ ] Role dropdown with: Manager, Safety Officer, Plant Manager, IT Admin
- [ ] No "Reporter" role option (reporters don't have accounts)
- [ ] Create user in Supabase Auth
- [ ] Insert user record in `users` table
- [ ] Validation: required fields, valid email format
- [ ] Error handling with Hebrew messages
- [ ] FR24 verified

---

#### Story 5.3: Role Assignment

**As an** IT Admin,
**I want** to change a user's role,
**So that** I can adjust permissions when responsibilities change.

**Acceptance Criteria:**

- **Given** I am on the user list
  **When** I tap on a user
  **Then** I see a user detail/edit view

- **Given** I am editing a user
  **When** I change their role from the dropdown
  **And** I save the changes
  **Then** the role is updated in the database
  **And** I see a success snackbar: "התפקיד עודכן בהצלחה"

- **Given** I am editing my own account
  **When** I try to remove my IT Admin role
  **Then** I see a warning: "לא ניתן להסיר הרשאת מנהל מעצמך"
  **And** the change is prevented

**Definition of Done:**
- [ ] User detail/edit dialog or page
- [ ] Role dropdown for editing
- [ ] Update user role in database
- [ ] Prevent self-demotion from IT Admin
- [ ] Success/error snackbars in Hebrew
- [ ] FR25 verified

---

#### Story 5.4: Remove User

**As an** IT Admin,
**I want** to remove users from the system,
**So that** former team members no longer have access.

**Acceptance Criteria:**

- **Given** I am viewing a user's details
  **When** I tap "הסר משתמש" (Remove User)
  **Then** I see a confirmation dialog: "האם אתה בטוח שברצונך להסיר את המשתמש?"

- **Given** the confirmation dialog is open
  **When** I confirm removal
  **Then** the user is deleted from Supabase Auth
  **And** the user record is removed (or marked inactive) in `users` table
  **And** I see a success snackbar: "המשתמש הוסר בהצלחה"
  **And** I return to the user list

- **Given** I try to remove myself
  **When** I tap Remove User
  **Then** I see an error: "לא ניתן להסיר את עצמך מהמערכת"
  **And** the removal is prevented

- **Given** a removed user tries to log in
  **When** they enter their credentials
  **Then** authentication fails

**Definition of Done:**
- [ ] "Remove User" button on user detail
- [ ] Confirmation dialog before deletion
- [ ] Delete or disable in Supabase Auth
- [ ] Delete or soft-delete user record
- [ ] Prevent self-deletion
- [ ] Hebrew confirmation and error messages
- [ ] FR26 verified

---

#### Story 5.5: Password Reset

**As an** IT Admin,
**I want** to reset a user's password,
**So that** I can help users who forgot their password.

**Acceptance Criteria:**

- **Given** I am viewing a user's details
  **When** I tap "איפוס סיסמה" (Reset Password)
  **Then** a password reset form or confirmation appears

- **Given** I initiate a password reset
  **When** the reset is triggered
  **Then** a new temporary password is generated or a reset email is sent
  **And** I see a success message indicating next steps

- **Given** a simple MVP approach
  **When** I reset a password
  **Then** I can enter a new password directly (no email flow needed for ~15 users)
  **And** the user's password is updated
  **And** I communicate the new password to the user out-of-band

- **Given** the password reset succeeds
  **When** the user logs in with the new password
  **Then** authentication succeeds

**Definition of Done:**
- [ ] "Reset Password" button on user detail
- [ ] Password reset form (enter new password)
- [ ] Update password in Supabase Auth
- [ ] Success snackbar in Hebrew
- [ ] Password validation (minimum length)
- [ ] FR28 verified

---

## Summary

### Story Count by Epic

| Epic | Stories | FRs Covered |
|------|---------|-------------|
| Epic 1: Foundation & Authentication | 6 | FR29, FR30, FR37, FR38, FR39 |
| Epic 2: Incident Reporting (Public) | 9 | FR1-FR9, FR9a, FR31, FR40 |
| Epic 3: Incident Management | 6 | FR10-FR18, FR34, FR41 |
| Epic 4: Incident Resolution | 3 | FR20-FR22, FR33 |
| Epic 5: User Management | 5 | FR24-FR28, FR36 |
| **Total** | **29** | **All FRs** |

### Implementation Order

1. **Epic 1** - Foundation establishes the base (must be first)
2. **Epic 2** - Core public reporting functionality (depends on 1)
3. **Epic 3** - Incident management for Safety Officers (depends on 1, 2)
4. **Epic 4** - Resolution workflow for Managers (depends on 3)
5. **Epic 5** - User management can be done after 1, parallel to others

### Access Model Summary

| Epic | Primary Access | Routes |
|------|----------------|--------|
| Epic 2 | **PUBLIC** (no login) | `/`, `/report` |
| Epic 1, 3, 4, 5 | **Authenticated** | `/manage/*` |

