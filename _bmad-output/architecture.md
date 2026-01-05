---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/prd.md
  - _bmad-output/ux-design-specification.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2025-12-27'
project_name: 'safety_app_bmad'
user_name: 'Eyaly'
date: '2025-12-27'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Architectural Principles (From Stakeholder Requirements)

| Principle | What It Means | Why It Matters |
|-----------|---------------|----------------|
| **Modular, not monolith** | Separate frontend, backend, database as independent deployable units | Allows replacing/upgrading parts independently; different teams can work in parallel; easier to test |
| **Scalable** | Horizontal scaling capability without rewrite | Start small but architecture doesn't block growth |
| **Extensible** | Clean APIs, plugin points for Phase 2/3 features | Dashboards, email notifications, AI insights can be added without rearchitecting |
| **Simple and clean** | Minimal moving parts; proven "boring" technology | Reduces bugs, maintenance burden, learning curve |
| **Cost-conscious** | Open source first; free-tier friendly | $0 licensing; minimal hosting costs |

### Requirements Overview

**Functional Requirements:**
43 requirements across 6 domains:
- Incident Reporting (FR1-9, FR9a-9b): **PUBLIC ACCESS** - Mobile-friendly form with severity, location, photo, name field or anonymous option, rate limiting
- Incident Management (FR10-18): **LOGIN REQUIRED** - Manager inbox, assignment workflow, status tracking
- Incident Resolution (FR19-23): **LOGIN REQUIRED** - Manager view, resolution with notes
- User Management (FR24-28): **LOGIN REQUIRED** - IT Admin manages ~10-15 manager/admin accounts (not all 50 employees)
- Authentication & Access (FR29-36): Login for managers only, public reporting for all, FR32 removed (no reporter history without login)
- Data Display (FR37-41): Hebrew RTL, date formats, touch UI, status indicators

**Access Model:**
- **Public Access (no login):** Anyone can submit incident reports via public URL
- **Authenticated Access (login required):** Manager, IT Admin access management features

**Non-Functional Requirements:**

| Category | Key Requirements |
|----------|-----------------|
| Performance | <3s load on 3G, <5s TTI, <2s form submit, background photo upload |
| Security | **Daily limit** (15 reports/day, configurable), auth for management, bcrypt passwords, 24h sessions, anonymous protection, HTTPS, role enforcement |
| Reliability | 99% uptime, maintenance windows OK, no data loss, graceful photo failure |
| Maintainability | Clean code, simple deploy, configurable locations, basic logging |

**Scale & Complexity:**
- Primary domain: Full-stack web application (mobile-first SPA)
- Complexity level: Low-Medium
- Estimated architectural components: ~8-10 (Auth, Incidents, Users, Photos, UI Shell, Forms, Lists, Dashboards placeholder)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|------------|--------|--------|
| Hebrew RTL | PRD + UX | All UI components must support RTL; affects CSS, component library choice |
| Mobile-first | PRD + UX | Design for <768px first; touch targets ≥48px; no hover dependencies |
| 3G performance | PRD | Aggressive bundle size limits; lazy loading; optimistic UI patterns |
| No external dependencies (MVP) | PRD | No email service; verbal/WhatsApp handoff for notifications |
| Photo upload reliability | PRD | Background upload; submit without waiting; retry logic |
| Browser support | PRD | Evergreen only (Chrome, Safari, Firefox, Edge); no IE11 |

### Cross-Cutting Concerns Identified

| Concern | Affects | Architectural Implication |
|---------|---------|--------------------------|
| RTL Layout | All UI | Theme-level RTL config; RTL-aware component library |
| **Public vs Authenticated Routes** | All routes, API endpoints | Public routes for reporting (`/`, `/report`), protected routes for management (`/manage/*`); no auth required for report submission |
| Role-Based Access | Management routes only | Centralized auth middleware; route guards; API authorization for authenticated features |
| Anonymous Reporting | Incident submission, storage, display | Reporter name is TEXT field (not FK); ensure no PII leakage for anonymous; no IP logging |
| **Daily Report Limit** | Incident submission | Simple daily limit (15/day, configurable); auto-resets at midnight; Hebrew message when limit reached |
| Photo Handling | Submit form, detail view, storage | Dedicated upload service; CDN/storage strategy; thumbnail generation |
| Error Handling | All operations | Hebrew error messages; graceful degradation; offline-resilient patterns |

## Starter Template Evaluation

### Technical Preferences (AI-Assisted Development)

Development will be AI-assisted with a non-technical product owner. Technology choices optimized for:
- Excellent documentation and community support
- Technologies AI assistants know extremely well
- Minimal complexity while maintaining modularity
- Free/low-cost options

### Primary Technology Domain

Full-stack web application (mobile-first SPA) with Backend-as-a-Service

### Starter Options Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Vite + React + Supabase** | Simple, MUI-compatible, backend included | Supabase dependency | **Selected** |
| **T3 Stack** | Full typesafety, popular | Uses Tailwind (not MUI), more complex | Too complex |
| **Vite + Custom Express** | Full control | Must build auth, file storage from scratch | Too much work |

### Selected Stack

**Frontend:**
- React 19.x (latest stable - Dec 2024)
- TypeScript 5.x
- Vite 7.x (latest stable - Jun 2025)
- MUI (Material UI) 7.x (latest stable - Mar 2025)
- React Router 7.x in Library Mode (v6-compatible API)

**Backend-as-a-Service:**
- Supabase (PostgreSQL + Auth + Storage)
- Supabase JS Client SDK 2.x

**Version Selection Rationale:**
> **Note:** This architecture was initially drafted with older versions (React 18, MUI 5, Vite 5, React Router 6). During implementation (Dec 2025), we discovered all these libraries had released stable, production-ready major versions with minimal breaking changes and significant improvements:
> - React 19 (stable Dec 2024) - Better async handling, React Server Components
> - MUI 7 (stable Mar 2025) - Better ESM support, improved bundling
> - Vite 7 (stable Jun 2025) - Faster builds, better HMR
> - React Router 7 (stable) - Non-breaking in library mode, better TypeScript
>
> Decision: Use latest stable versions for better security, performance, and long-term maintainability.

**Initialization Commands:**

```bash
# Create frontend (uses latest stable versions)
npm create vite@latest safety-first -- --template react-ts
cd safety-first
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @supabase/supabase-js
npm install react-router-dom
```

### Architectural Decisions Provided by This Stack

**Language & Runtime:**
- TypeScript throughout (catches errors, better IDE support)
- Node.js for development tooling

**Styling Solution:**
- MUI (Material UI) with Emotion
- RTL support via MUI's `createTheme`

**Build Tooling:**
- Vite (fast builds, hot reload)
- ESBuild for production bundling

**Authentication:**
- Supabase Auth (email/password, social auth options)
- Built-in session management

**Database:**
- PostgreSQL via Supabase
- Row Level Security for role-based access

**File Storage:**
- Supabase Storage for incident photos
- Built-in upload/download APIs

**Code Organization:**
- Feature-based folder structure
- Separate API layer via Supabase client

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Summary

| Category | Decision | Rationale |
|----------|----------|-----------|
| State Management | React Context | Simple, built-in, sufficient for ~50 users |
| Routing | React Router | Industry standard, AI-friendly |
| Component Structure | Feature-based folders | Modular, easy to navigate |
| **Public vs Auth Access** | Split routes: public `/report`, protected `/manage/*` | Anyone can report without login; only managers need accounts |
| Role Access | Supabase Row Level Security | Security enforced at database level for management features |
| Anonymous Reports | Null/empty reporter_name TEXT field | True anonymity, no trace possible, no FK to users |
| **Daily Limit** | 15 reports/day (configurable), auto-reset at midnight | Simple protection without complexity |
| Hosting | Vercel (frontend) + Supabase (backend) | Free tiers, simple, reliable |

### Frontend Architecture

**State Management: React Context**
- Built-in React feature, no additional dependencies
- Sufficient for application complexity (~50 users, straightforward data flow)
- Can upgrade to Zustand/Redux later if needed (unlikely)

**Routing: React Router**
- Industry standard for React applications
- Well-documented, AI assistants know it thoroughly
- Supports protected routes for role-based access

**Component Structure: Feature-Based Folders**

```
src/
├── features/
│   ├── incidents/          # Incident reporting, list, detail
│   │   ├── IncidentForm.tsx
│   │   ├── IncidentList.tsx
│   │   └── IncidentDetail.tsx
│   ├── auth/               # Login, session management
│   │   ├── LoginPage.tsx
│   │   └── AuthProvider.tsx
│   └── users/              # User management (IT Admin)
│       ├── UserList.tsx
│       └── UserForm.tsx
├── components/             # Shared/reusable components
│   ├── StatusChip.tsx
│   ├── SeverityPicker.tsx
│   └── PhotoUpload.tsx
├── lib/                    # Utilities, Supabase client
│   ├── supabase.ts
│   └── constants.ts
└── theme/                  # MUI theme with RTL config
    └── theme.ts
```

### Authentication & Security

**Public vs Authenticated Access Model:**

| Access Type | Routes | Who | Authentication |
|-------------|--------|-----|----------------|
| **Public** | `/`, `/report` | Anyone with URL | None required |
| **Authenticated** | `/manage/*` | Manager, IT Admin | Login required |

**Role-Based Access: Supabase Row Level Security (RLS)**

Security enforced at the database level for authenticated features only.

| Role | Database Access |
|------|-----------------|
| Manager | All incidents (full CRUD) |
| IT Admin | All incidents + users table |

**Simplified 2-Role Model for MVP:**
- **Manager** role consolidates Safety Officer, Plant Manager, and Shift Manager responsibilities
- All managers can view, assign, and resolve incidents
- Supports ~10-15 manager accounts (not all 50 employees)
- Future phases may add role specialization if needed

**Note:** "Reporter" is no longer a database role - anyone can submit via public form without an account.

**Anonymous Reporting: Optional Name Field**

| Report Type | `reporter_name` | Traceable? |
|-------------|-----------------|------------|
| Named | Text entered by reporter | Only if they provide real name |
| Anonymous | `null` (field left blank) | No |

Implementation rules:
- No IP address logging for any submissions
- Reporter name is a TEXT field, not a foreign key to users
- Name field is optional - leaving it blank = anonymous report
- No toggle needed - simplicity over explicitness
- No way to trace anonymous reports back to a person

**Daily Report Limit:**

| Aspect | Implementation |
|--------|----------------|
| **Limit** | 15 reports per day (configurable via `VITE_DAILY_REPORT_LIMIT`) |
| **Reset** | Automatic at midnight |
| **Hebrew Message** | "המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות" |
| **Implementation** | Simple counter in `daily_report_counts` table |

This is intentionally simple - for an internal plant app with ~50 employees, complex bot protection is unnecessary.

**Plant Locations Management:**
- Locations are managed directly in Supabase Table Editor (web UI)
- IT Admin can add/edit/delete locations without code changes
- No dedicated admin UI needed in MVP

### Infrastructure & Deployment

**Hosting Architecture:**

```
[User's Browser]
       │
       │ HTTPS
       ▼
[Vercel - Frontend]     ←── React SPA (static files)
       │
       │ HTTPS API calls
       ▼
[Supabase Cloud]
   ├── Auth Service     ←── Login, sessions, JWT tokens
   ├── PostgreSQL DB    ←── Incidents, users, roles
   └── Storage          ←── Incident photos
```

**Cost Estimate:**

| Service | Free Tier Limits | Our Usage | Cost |
|---------|------------------|-----------|------|
| Vercel | 100GB bandwidth/month | ~50 users, minimal | $0 |
| Supabase | 500MB DB, 1GB storage, 50K MAU | Well within limits | $0 |
| **Total** | | | **$0/month** |

**Environment Configuration:**
- Development: Local Vite server + Supabase project (dev)
- Production: Vercel + Supabase project (prod)
- Environment variables for Supabase URL and keys

### Deferred Decisions (Phase 2+)

| Decision | Why Deferred | Phase |
|----------|--------------|-------|
| Email notifications | Not in MVP scope | Phase 2 |
| Caching strategy | Not needed at 50 users | Phase 2 |
| CDN for photos | Supabase Storage sufficient for MVP | Phase 2 |
| CI/CD pipeline | Manual deploy acceptable for MVP | Phase 2 |
| Monitoring/logging | Basic browser console for MVP | Phase 2 |

## Implementation Patterns & Consistency Rules

### Purpose

These patterns ensure all AI assistants working on this project write consistent, compatible code. Without these rules, different AI agents might make different choices that break the application.

### Naming Patterns

**Database Naming Conventions:**

| Element | Pattern | Example |
|---------|---------|---------|
| Tables | lowercase, plural, snake_case | `incidents`, `users`, `plant_locations` |
| Columns | lowercase, snake_case | `created_at`, `reporter_id`, `is_anonymous` |
| Foreign keys | referenced_table_id | `reporter_id` → references `users.id` |
| Booleans | is_ or has_ prefix | `is_anonymous`, `is_resolved`, `has_photo` |
| Timestamps | _at suffix | `created_at`, `updated_at`, `resolved_at` |

**Code Naming Conventions:**

| Element | Pattern | Example |
|---------|---------|---------|
| React Components | PascalCase | `IncidentForm`, `StatusChip` |
| Component Files | Same as component | `IncidentForm.tsx`, `StatusChip.tsx` |
| Functions | camelCase | `getIncidents()`, `submitReport()` |
| Variables | camelCase | `incidentList`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `MAX_PHOTO_SIZE`, `API_TIMEOUT` |
| Hooks | use prefix | `useIncidents()`, `useAuth()` |
| Context | Context suffix | `AuthContext`, `IncidentContext` |
| Types/Interfaces | PascalCase | `Incident`, `User`, `IncidentFormData` |

### Structure Patterns

**File Organization Rules:**

```
src/
├── features/              # Feature modules
│   ├── incidents/
│   │   ├── components/    # Feature-specific components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── api.ts         # Supabase calls for this feature
│   │   ├── types.ts       # Types for this feature
│   │   └── index.ts       # Public exports
│   ├── auth/
│   └── users/
├── components/            # ONLY shared components
├── hooks/                 # ONLY shared hooks
├── lib/                   # Utilities, Supabase client
├── theme/                 # MUI theme configuration
└── types/                 # Shared TypeScript types
```

**Rule:** Components used by only ONE feature live in that feature's folder. Only truly shared components go in `/components`.

### Format Patterns

**API Response Handling:**

```typescript
// Supabase query pattern
const { data, error } = await supabase
  .from('incidents')
  .select('*')

// UI state pattern
interface QueryState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}
```

**Date & Time Formats:**

| Context | Format | Example |
|---------|--------|---------|
| Database storage | ISO 8601 (automatic) | `2025-12-27T14:30:00Z` |
| API responses | ISO 8601 strings | `"2025-12-27T14:30:00Z"` |
| UI display (date) | DD/MM/YYYY | `27/12/2025` |
| UI display (time) | 24-hour | `14:30` |
| UI display (datetime) | DD/MM/YYYY HH:mm | `27/12/2025 14:30` |

**JSON Field Naming:**
- Database → API: snake_case (Supabase default)
- TypeScript interfaces: camelCase (transform on fetch)

### Error Handling Patterns

**Error Display:**

| Error Type | UI Pattern | Example |
|------------|------------|---------|
| Form validation | Inline error under field | Red text below input |
| API error | Snackbar notification | Toast at bottom |
| Network error | Snackbar + retry option | "אין חיבור" + retry button |
| Auth error | Redirect to login | Automatic redirect |

**Error Structure:**

```typescript
interface AppError {
  message: string      // Hebrew message for user display
  code: string         // Machine-readable code for debugging
  field?: string       // Optional: which form field failed
}
```

**Standard Error Codes:**

| Code | Hebrew Message | When Used |
|------|----------------|-----------|
| `NETWORK_ERROR` | אין חיבור לאינטרנט | Fetch failed |
| `AUTH_REQUIRED` | נדרשת התחברות | 401 response |
| `FORBIDDEN` | אין הרשאה לפעולה זו | 403 response |
| `NOT_FOUND` | הפריט לא נמצא | 404 response |
| `VALIDATION_ERROR` | נתונים לא תקינים | Form validation failed |
| `UPLOAD_FAILED` | העלאת התמונה נכשלה | Photo upload error |

### Loading State Patterns

**Naming Convention:**

```typescript
isLoading        // Generic loading state
isSubmitting     // Form submission in progress
isUploading      // File upload in progress
isFetching       // Data fetch in progress
```

**UI Patterns:**

| Situation | Pattern |
|-----------|---------|
| Initial page load | Full-screen centered spinner |
| List loading | Skeleton cards (MUI Skeleton) |
| Button action | Spinner inside button, button disabled |
| Photo upload | Linear progress bar with percentage |
| Pull to refresh | Circular progress at top |

### Component Patterns

**Standard Component Structure:**

```typescript
// IncidentCard.tsx
import { FC } from 'react'
import { Card, Typography } from '@mui/material'
import { Incident } from './types'

interface IncidentCardProps {
  incident: Incident
  onSelect?: (id: string) => void
}

export const IncidentCard: FC<IncidentCardProps> = ({
  incident,
  onSelect
}) => {
  // Component implementation
}
```

**Props Interface Rules:**
- Always define explicit interface for props
- Use optional `?` for non-required props
- Callbacks named with `on` prefix: `onClick`, `onSubmit`, `onSelect`

### Enforcement Guidelines

**All AI Assistants Working on This Project MUST:**

1. Follow database naming: lowercase, plural tables, snake_case columns
2. Follow code naming: PascalCase components, camelCase functions
3. Place feature-specific code in feature folders
4. Display dates as DD/MM/YYYY (Israeli format)
5. Show errors in Hebrew via Snackbar
6. Use `isLoading`, `isSubmitting` naming for loading states
7. Define TypeScript interfaces for all props and data structures

**Anti-Patterns to Avoid:**

| Bad | Good | Why |
|-----|------|-----|
| `Users` table | `users` table | PostgreSQL convention |
| `userId` column | `user_id` column | Database snake_case |
| `incident-card.tsx` | `IncidentCard.tsx` | Component naming |
| `MM/DD/YYYY` display | `DD/MM/YYYY` display | Israeli format |
| English error messages | Hebrew error messages | User language |

## Project Structure & Boundaries

### Complete Project Directory Structure

```
safety-first/
├── README.md                          # Project documentation
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── vite.config.ts                     # Vite build configuration
├── index.html                         # App entry point
├── .env.example                       # Environment variable template
├── .env.local                         # Local environment (git-ignored)
├── .gitignore                         # Git ignore rules
│
├── public/                            # Static assets (copied as-is)
│   ├── favicon.ico
│   └── manifest.json                  # PWA manifest (for home screen)
│
├── src/
│   ├── main.tsx                       # React entry point
│   ├── App.tsx                        # Root component with routing
│   ├── vite-env.d.ts                  # Vite type definitions
│   │
│   ├── theme/                         # MUI Theme Configuration
│   │   ├── theme.ts                   # Theme with RTL, colors, Hebrew fonts
│   │   └── ThemeProvider.tsx          # Theme context wrapper
│   │
│   ├── lib/                           # Core Utilities
│   │   ├── supabase.ts                # Supabase client initialization
│   │   ├── constants.ts               # App constants (locations, severities)
│   │   ├── dateUtils.ts               # Date formatting (DD/MM/YYYY)
│   │   └── errorUtils.ts              # Error handling utilities
│   │
│   ├── types/                         # Shared TypeScript Types
│   │   ├── index.ts                   # Re-exports all types
│   │   ├── incident.ts                # Incident, IncidentFormData
│   │   ├── user.ts                    # User, UserRole
│   │   └── common.ts                  # Shared types (AppError, etc.)
│   │
│   ├── components/                    # Shared/Reusable Components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Main app layout with nav
│   │   │   ├── BottomNav.tsx          # Bottom navigation bar
│   │   │   └── PageHeader.tsx         # Page title header
│   │   ├── feedback/
│   │   │   ├── LoadingSpinner.tsx     # Full-screen loading
│   │   │   ├── ErrorSnackbar.tsx      # Error notifications
│   │   │   └── SuccessSnackbar.tsx    # Success notifications
│   │   ├── StatusChip.tsx             # Incident status badge
│   │   ├── SeverityPicker.tsx         # Severity selection buttons
│   │   └── PhotoUpload.tsx            # Camera/photo component
│   │
│   ├── hooks/                         # Shared Hooks
│   │   ├── useSnackbar.ts             # Snackbar state management
│   │   └── useMediaQuery.ts           # Responsive breakpoints
│   │
│   ├── features/                      # Feature Modules
│   │   │
│   │   ├── auth/                      # Authentication Feature
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx      # Login form component
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx    # Auth state provider
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts         # Auth hook (login, logout)
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx      # Login page
│   │   │   ├── api.ts                 # Supabase auth calls
│   │   │   ├── types.ts               # Auth-specific types
│   │   │   └── index.ts               # Public exports
│   │   │
│   │   ├── incidents/                 # Incident Management Feature
│   │   │   ├── components/
│   │   │   │   ├── IncidentCard.tsx   # List item card
│   │   │   │   ├── IncidentForm.tsx   # Report form (FR1-9)
│   │   │   │   ├── IncidentFilters.tsx # Status/severity filters
│   │   │   │   └── AssigneeSheet.tsx  # Assignment bottom sheet
│   │   │   ├── hooks/
│   │   │   │   ├── useIncidents.ts    # Fetch incidents list
│   │   │   │   └── useIncident.ts     # Fetch single incident
│   │   │   ├── pages/
│   │   │   │   ├── IncidentListPage.tsx    # List view (FR10-11)
│   │   │   │   ├── IncidentDetailPage.tsx  # Detail view (FR12)
│   │   │   │   └── ReportIncidentPage.tsx  # New report page
│   │   │   ├── api.ts                 # Supabase incident queries
│   │   │   ├── types.ts               # Incident types
│   │   │   └── index.ts               # Public exports
│   │   │
│   │   └── users/                     # User Management Feature
│   │       ├── components/
│   │       │   ├── UserCard.tsx       # User list item
│   │       │   └── UserForm.tsx       # Add/edit user form
│   │       ├── hooks/
│   │       │   └── useUsers.ts        # Fetch users list
│   │       ├── pages/
│   │       │   ├── UserListPage.tsx   # User management (FR24-27)
│   │       │   └── UserDetailPage.tsx # User detail/edit
│   │       ├── api.ts                 # Supabase user queries
│   │       ├── types.ts               # User types
│   │       └── index.ts               # Public exports
│   │
│   └── routes/                        # Routing Configuration
│       ├── index.tsx                  # Route definitions
│       ├── ProtectedRoute.tsx         # Auth guard component
│       └── RoleRoute.tsx              # Role-based guard
│
└── supabase/                          # Supabase Configuration
    ├── config.toml                    # Local dev config (if using CLI)
    └── migrations/                    # Database migrations
        ├── 001_create_users.sql       # Users table + roles
        ├── 002_create_incidents.sql   # Incidents table
        ├── 003_create_locations.sql   # Plant locations
        └── 004_setup_rls.sql          # Row Level Security policies
```

### Requirements to Structure Mapping

| Requirement Category | Location | Access |
|---------------------|----------|--------|
| **FR1-9, FR9a-9b: Incident Reporting** | `src/features/incidents/` | **PUBLIC** |
| **FR10-18: Incident Management** | `src/features/incidents/` | Authenticated |
| **FR19-23: Resolution** | `src/features/incidents/components/` | Authenticated |
| **FR24-28: User Management** | `src/features/users/` | Authenticated (IT Admin) |
| **FR29-36: Authentication** | `src/features/auth/` | Authenticated |
| **FR37-41: Display/RTL** | `src/theme/` + all components | All |

**Note:** FR32 (reporter history) removed - reporters don't have accounts.

### Database Schema (Supabase)

```sql
-- users table (extends Supabase auth.users)
-- NOTE: Only for managers/admins (~10-15 users), NOT all 50 employees
-- Production line employees submit reports via public form without accounts
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'manager',  -- manager, it_admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- incidents table
-- NOTE: reporter_name is TEXT (not FK to users) - anyone can submit without account
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name TEXT,                     -- NULL/empty for anonymous, text for named reports
  is_anonymous BOOLEAN DEFAULT FALSE,
  severity TEXT NOT NULL DEFAULT 'unknown',
  location_id UUID REFERENCES plant_locations(id),
  incident_date TIMESTAMPTZ,              -- when the incident occurred
  description TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES users(id),  -- FK to users (managers only)
  assigned_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),   -- when the report was submitted
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- plant_locations table
CREATE TABLE plant_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_he TEXT NOT NULL,  -- Hebrew name
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_report_count table (for rate limiting)
CREATE TABLE daily_report_counts (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  is_paused BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
```sql
-- Public can INSERT incidents (no auth required)
CREATE POLICY "Anyone can submit incidents" ON incidents
  FOR INSERT TO anon WITH CHECK (true);

-- Only authenticated users can SELECT incidents
CREATE POLICY "Authenticated users can view incidents" ON incidents
  FOR SELECT TO authenticated USING (true);

-- Managers can UPDATE any incident
CREATE POLICY "Managers can update incidents" ON incidents
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'manager')
  );
```

### Data Flow

```
[User Action]
     │
     ▼
[React Component] ──► [Feature Hook] ──► [Feature API] ──► [Supabase Client]
     │                      │                                      │
     │                      │                                      ▼
     ◄──────────────────────┴──────────────────────────── [Supabase Cloud]
     │                                                             │
     ▼                                                             ▼
[UI Update]                                               [PostgreSQL + RLS]
```

### Key File Responsibilities

| File | Responsibility |
|------|----------------|
| `src/lib/supabase.ts` | Single Supabase client instance |
| `src/theme/theme.ts` | RTL config, Hebrew fonts, color palette |
| `src/features/*/api.ts` | All Supabase queries for that feature |
| `src/features/*/hooks/*.ts` | React hooks wrapping API calls |
| `src/routes/ProtectedRoute.tsx` | Redirects unauthenticated users |
| `src/routes/RoleRoute.tsx` | Blocks access based on user role |

### Integration Boundaries

**Frontend ↔ Supabase:**
- All database access via `@supabase/supabase-js` client
- Auth state managed by Supabase Auth
- File uploads via Supabase Storage API
- Row Level Security enforces permissions

**Component ↔ Component:**
- Props for parent-child communication
- React Context for global state (auth, theme)
- No direct component-to-component communication

**Feature ↔ Feature:**
- Features do not import from each other directly
- Shared code lives in `/components`, `/hooks`, `/lib`, `/types`
- Each feature is self-contained and independently testable

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SAFETY FIRST                                    │
│                         System Architecture                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │   Yossi     │     │    Avi      │     │   Moshe     │
    │  (Reporter) │     │  (Safety    │     │ (IT Admin)  │
    │   Mobile    │     │   Officer)  │     │  Desktop    │
    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
           │                   │                   │
           └───────────────────┼───────────────────┘
                               │
                         HTTPS (443)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend Hosting)                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     React SPA (safety-first)                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │    Auth     │  │  Incidents  │  │    Users    │  │   Shared    │  │  │
│  │  │   Feature   │  │   Feature   │  │   Feature   │  │ Components  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │  MUI Theme (RTL Hebrew)  │  React Router  │  React Context     │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                     Supabase JS Client
                         HTTPS API
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (Backend-as-a-Service)                      │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐   │
│  │               │  │               │  │                               │   │
│  │  Auth Service │  │   Storage     │  │      PostgreSQL Database      │   │
│  │               │  │   (Photos)    │  │                               │   │
│  │  • Login      │  │               │  │  ┌─────────┐  ┌───────────┐  │   │
│  │  • Sessions   │  │  • Upload     │  │  │  users  │  │ incidents │  │   │
│  │  • JWT Tokens │  │  • Download   │  │  └────┬────┘  └─────┬─────┘  │   │
│  │               │  │  • CDN        │  │       │             │        │   │
│  └───────────────┘  └───────────────┘  │       └──────┬──────┘        │   │
│                                        │              │               │   │
│                                        │  ┌───────────▼───────────┐   │   │
│                                        │  │   plant_locations     │   │   │
│                                        │  └───────────────────────┘   │   │
│                                        │                               │   │
│                                        │  Row Level Security (RLS)     │   │
│                                        │  enforces role-based access   │   │
│                                        └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA (ERD)                             │
│                     (Public Reporting + Auth Management)                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│         users           │
│  (Managers/Admins ONLY) │
├─────────────────────────┤
│ PK  id            UUID  │─────────────────────────────────┐
│     email         TEXT  │                                 │
│     full_name     TEXT  │                                 │
│     role          TEXT  │ (manager/it_admin)              │
│                         │  NO "reporter" role - public    │
│     created_at TIMESTAMP│                                 │
│     updated_at TIMESTAMP│                                 │
└─────────────────────────┘                                 │
                                                            │
                                                            │ assigned_to
┌─────────────────────────┐                                 │
│       incidents         │                                 │
│   (Public submission)   │                                 │
├─────────────────────────┤                                 │
│ PK  id            UUID  │                                 │
│     reporter_name TEXT  │──(TEXT, not FK! Anyone can      │
│                         │   submit without account)       │
│     is_anonymous  BOOL  │                                 │
│     severity      TEXT  │ (unknown/near-miss/minor/       │
│                         │  major/critical)                │
│ FK  location_id   UUID  │───────────────┐                 │
│     incident_date TIMESTAMP             │                 │
│     description   TEXT  │               │                 │
│     photo_url     TEXT  │               │                 │
│     status        TEXT  │ (new/assigned/│                 │
│                         │  resolved)    │                 │
│ FK  assigned_to   UUID  │───────────────│─────────────────┘
│     assigned_at TIMESTAMP               │
│     resolution_notes TEXT│              │
│     resolved_at TIMESTAMP│              │
│     created_at TIMESTAMP│               │
│     updated_at TIMESTAMP│               │
└─────────────────────────┘               │
                                          │
                                          │ 1
                                          │
                                          ▼ 0..n
                              ┌─────────────────────────┐
                              │    plant_locations      │
                              ├─────────────────────────┤
                              │ PK  id          UUID    │
                              │     name        TEXT    │
                              │     name_he     TEXT    │ (Hebrew)
                              │     is_active   BOOL    │
                              │     created_at TIMESTAMP│
                              └─────────────────────────┘

┌─────────────────────────┐
│  daily_report_counts    │
│   (Rate limiting)       │
├─────────────────────────┤
│ PK  date        DATE    │
│     count       INT     │
│     is_paused   BOOL    │
│     updated_at TIMESTAMP│
└─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            RELATIONSHIPS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  incidents.reporter_name   TEXT field (not FK) - anyone can submit          │
│  users.id          ──1:N──►  incidents.assigned_to   (manager assignment)   │
│  plant_locations.id ──1:N──► incidents.location_id   (where it happened)    │
│                                                                             │
│  Note: reporter_name is NULL/empty for anonymous reports                    │
│  Note: users table only contains ~10-15 managers, NOT all 50 employees      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together seamlessly:
- Vite 7 + React 19 + TypeScript 5: Latest stable, modern stack
- MUI 7 + Emotion: Built for React, excellent RTL support, improved ESM
- Supabase 2.x: Provides auth, database, storage in one service
- React Router 7 (Library Mode): v6-compatible API, standard routing for React SPAs

**Pattern Consistency:**
- Naming conventions align with React/TypeScript best practices
- Feature-based structure matches component organization
- Error handling patterns work with Supabase error responses

**Structure Alignment:**
- Project structure supports all architectural decisions
- Clear boundaries between features, shared code, and configuration
- Integration points well-defined (Supabase client in `/lib`)

### Requirements Coverage Validation ✅

| Requirement Area | Status | Implementation Location | Access |
|-----------------|--------|------------------------|--------|
| FR1-9, FR9a-9b: Incident Reporting | ✅ Covered | `features/incidents/IncidentForm` | **PUBLIC** |
| FR10-18: Incident Management | ✅ Covered | `features/incidents/IncidentList` | Authenticated |
| FR19-23: Resolution | ✅ Covered | `features/incidents/IncidentDetail` | Authenticated |
| FR24-28: User Management | ✅ Covered | `features/users/` | Authenticated |
| FR29-36: Authentication | ✅ Covered | `features/auth/` + Supabase RLS | Authenticated |
| FR32: Reporter History | ⏹️ Removed | N/A - reporters don't have accounts | N/A |
| FR37-41: Display/RTL | ✅ Covered | `theme/theme.ts` + all components | All |
| Performance NFRs | ✅ Covered | Vite bundling, Supabase CDN | All |
| Security NFRs | ✅ Covered | Daily limit, RLS, HTTPS | All |
| Reliability NFRs | ✅ Covered | Supabase managed infrastructure | All |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical technology decisions documented
- Versions can be verified at implementation time
- Clear rationale for each choice

**Structure Completeness:**
- Every file and directory specified
- Database schema fully defined
- Integration boundaries documented

**Pattern Completeness:**
- Naming conventions comprehensive
- Error handling patterns defined with Hebrew messages
- Loading state patterns specified
- Component structure patterns documented

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low-Medium, ~50 users)
- [x] Technical constraints identified (RTL, mobile-first, 3G)
- [x] Cross-cutting concerns mapped (auth, photos, errors)

**✅ Architectural Decisions**
- [x] Technology stack fully specified
- [x] All critical decisions documented
- [x] Integration patterns defined (Supabase client)
- [x] Security approach documented (RLS, anonymous)

**✅ Implementation Patterns**
- [x] Naming conventions established (database, code)
- [x] Structure patterns defined (feature-based)
- [x] Communication patterns specified (props, context)
- [x] Process patterns documented (errors, loading)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Database schema documented
- [x] Requirements mapped to locations

**✅ Visual Documentation**
- [x] System architecture diagram
- [x] Entity relationship diagram (ERD)

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1. Truly modular - frontend and backend completely separated
2. Zero licensing cost - all open source, free tier hosting
3. AI-friendly - well-documented technologies
4. Security-first - database-level access control
5. Simple yet extensible - clean foundation for Phase 2/3

**Deferred to Phase 2:**
- Testing strategy and CI/CD pipeline
- Email notifications
- Advanced monitoring and logging
- Caching and CDN optimization

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and feature boundaries
- Refer to this document for all architectural questions

**First Implementation Steps:**
```bash
# 1. Create project
npm create vite@latest safety-first -- --template react-ts

# 2. Install dependencies
cd safety-first
npm install @mui/material @emotion/react @emotion/styled
npm install @supabase/supabase-js
npm install react-router-dom

# 3. Set up Supabase project at supabase.com
# 4. Configure environment variables
# 5. Create database tables using schema in this document
```

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-27
**Document Location:** `_bmad-output/architecture.md`

### Final Architecture Deliverables

**Complete Architecture Document:**
- All architectural decisions documented with technology choices
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- System architecture diagram and ERD
- Validation confirming coherence and completeness

**Implementation Ready Foundation:**
- 12+ architectural decisions made
- 7 implementation pattern categories defined
- 3 feature modules specified (auth, incidents, users)
- 41 functional requirements fully supported

**AI Agent Implementation Guide:**
- Technology stack: Vite + React + TypeScript + MUI + Supabase
- Consistency rules that prevent implementation conflicts
- Project structure with clear feature boundaries
- Integration patterns and communication standards

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All 41 functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled (RTL, auth, photos)
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Your Architecture Strengths

| Strength | What It Means For You |
|----------|----------------------|
| **Truly Modular** | Frontend and backend are completely separate - you can change one without breaking the other |
| **Zero Cost** | All open source tools, free hosting tiers - $0/month to run |
| **AI-Friendly** | Technologies AI assistants know extremely well - faster, better implementation |
| **Zero-Friction Reporting** | Public access for incident reports - no login barrier for production workers |
| **Simple Security** | Daily limit for public form + RLS for management features - appropriate for internal app |
| **Simple Yet Extensible** | Clean foundation for Phase 2/3 features without rearchitecting |

---

**Architecture Status:** ✅ READY FOR IMPLEMENTATION

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

