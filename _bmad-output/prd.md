---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - _bmad-output/analysis/product-brief-safety_app_bmad-2025-12-16.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
project_name: 'safety_app_bmad'
user_name: 'Eyaly'
date: '2025-12-17'
status: 'complete'
completedAt: '2025-12-27'
---

# Product Requirements Document - Safety First

**Author:** Eyaly
**Date:** 2025-12-17

---

## Executive Summary

**Safety First** is a web-based safety incident management application designed for industrial plant environments. Built for a single-site operation with approximately 50 employees, the application addresses a critical gap: safety incidents that go unreported, untracked, and unresolved—leading to preventable injuries and financial losses.

The application enables any employee to report safety incidents (including near-misses) from any mobile phone or laptop **without requiring login or an account**. Reports capture essential details including location, time, description, severity level, and optional photos—with an anonymous reporting option to encourage participation without fear of blame.

**Public Reporting Rationale:** Production line employees often lack work email addresses, may share devices, and have limited time or technical comfort for login procedures. By making incident reporting accessible via a simple URL with no authentication barrier, we maximize the likelihood that safety concerns are reported. Reporters can optionally enter their name or remain fully anonymous. Management functions (viewing, assigning, resolving incidents) require authentication to protect sensitive data.

The Safety Officer can assign incidents to responsible managers with due dates, while leadership gains access to real-time dashboards, trend analytics, and (in future phases) AI-driven insights to identify patterns and prevent future incidents.

**Target Outcomes (6 months):** 5+ incidents reported, 3+ lessons learned with implemented fixes, measurable improvement in safety culture.

### What Makes This Special

| Differentiator | Value |
|----------------|-------|
| **Anonymous Reporting Option** | Removes fear barrier, dramatically increases reporting rates |
| **Near-Miss Capture** | Severity classification captures near-misses—the gold standard for prevention |
| **Tailored Workflow** | Built specifically for your plant's processes, not generic enterprise software |
| **AI-Driven Insights** (Phase 3) | Future capability to identify patterns humans might miss |

## Project Classification

**Technical Type:** Web Application (mobile-first, responsive)
**Domain:** Industrial Safety / Internal Enterprise Tool
**Complexity:** Low-Medium
**Project Context:** Greenfield - new project

This is an internal enterprise safety management system serving ~50 employees at a single industrial plant site. The application prioritizes simplicity and accessibility, with Hebrew UI and mobile-first design to ensure adoption by all employees regardless of technical comfort level.

---

## Success Criteria

### User Success

| User | Success Metric | Target |
|------|----------------|--------|
| **Yossi (Reporter)** | Time to submit incident report | ≤ 5 minutes |
| **Avi (Safety Officer)** | Time to triage and assign incident | ≤ 5 minutes |
| **Dana (Responder)** | Time to acknowledge assignment | Within 24 hours |
| **Ronen (Plant Manager)** | Dashboard insight value | Identifies 1+ actionable pattern per month |

### Business Success

| Objective | Measurement | Target | Timeframe |
|-----------|-------------|--------|-----------|
| **Build Reporting Culture** | Total incidents reported | 5+ reports | First 3 months |
| **Build Reporting Culture** | Total incidents reported | 12+ reports | First 6 months |
| **Capture Learnings** | Lessons learned with implemented fixes | 3+ | First 6 months |
| **Reduce Incidents** | Incident frequency trend | Decreasing | After baseline period |
| **Prevent Repeat Incidents** | Repeat incident rate | Decreasing trend | Ongoing |
| **Employee Participation** | % of employees who reported at least once | Growing month-over-month | Ongoing |

**Key Performance Indicators:**

*Leading Indicators (predict future success):*
| KPI | Why It Matters | Target |
|-----|----------------|--------|
| Near-miss ratio | High ratio = catching issues before injury | > 15% of reports are near-misses |
| Time to first report | Early adoption signal | Within 1 week of launch |
| Anonymous vs. named ratio | Trust indicator—named should increase over time | Track trend |
| Reports per employee | Broad participation vs. few super-reporters | Spread across workforce |

*Lagging Indicators (confirm success):*
| KPI | Why It Matters | Target |
|-----|----------------|--------|
| Days since last major incident | Ultimate safety measure | Increasing streak |
| Average resolution time | Accountability measure | Decreasing trend |
| Safety-related costs | Financial impact | Decreasing trend |

### Technical Success

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Page Load Time** | < 3 seconds on mobile networks | Critical for shop floor adoption |
| **Availability** | 99% uptime | Allows for maintenance windows |
| **Browser Compatibility** | Chrome, Safari on Android/iOS | Covers workforce devices |
| **Accessibility** | Hebrew RTL, simple UI | Supports low-tech-comfort users |
| **Photo Upload** | Works reliably on mobile data | Essential for incident documentation |

### Measurable Outcomes

**3-Month Milestone (MVP Validation):**
- ✓ First incident reported within 1 week of launch
- ✓ 5+ incidents captured and tracked
- ✓ 100% of incidents assigned within 24 hours
- ✓ Safety Officer actively using triage workflow

**6-Month Milestone (Product-Market Fit):**
- ✓ 12+ incidents reported
- ✓ 10+ unique reporters (20% of workforce)
- ✓ 3+ lessons learned documented with implemented fixes
- ✓ All incidents have resolution status tracked

**12-Month Vision (Culture Change):**
- ✓ Reporting is routine—employees report without hesitation
- ✓ Near-miss ratio > 15% (proactive safety culture)
- ✓ Measurable reduction in safety-related costs
- ✓ Ready for Phase 2 (dashboards, analytics)

---

## Product Scope

### MVP - Minimum Viable Product (Phase 1: "Report & Assign")

| Feature | Description |
|---------|-------------|
| **Incident Reporting Form** | Severity (unknown/near-miss/minor/major/critical, defaults to unknown), location, date/time, description, optional photo |
| **Public Access Reporting** | No login required—anyone with the URL can submit a report |
| **Reporter Name Field** | Optional text field for reporter to enter their name |
| **Anonymous Option** | Toggle to submit without reporter name (name field hidden when anonymous) |
| **Incident List** | Simple list view, sortable by date—serves as Safety Officer's inbox (login required) |
| **Assignment** | Recent assignees as quick-select buttons + free text email field with browser cache fallback |
| **Resolution** | Manager marks incident as resolved with optional notes |
| **Access Model** | Public (reporting) vs Authenticated (management) - see Access Model section below |
| **Notifications** | None in MVP—Safety Officer checks app daily; verbal handoff for assignments (Email notifications added in Phase 2) |
| **Language** | Hebrew UI with simple language |

**Access Model:**

| Access Type | Who | What They Can Do | Authentication |
|-------------|-----|------------------|----------------|
| **Public** | Anyone with URL | Submit incident reports (named or anonymous) | None required |
| **Authenticated** | Manager | View assigned incidents, mark resolved | Login required |
| **Authenticated** | Safety Officer | View all incidents, assign to managers | Login required |
| **Authenticated** | Plant Manager | View all incidents (read-only) | Login required |
| **Authenticated** | IT Admin | Manage user accounts | Login required |

**Security for Public Reporting:**
- Daily limit: After 15 reports/day, submissions paused with Hebrew message to contact Safety Officer
- Limit configurable via environment variable
- Auto-resets at midnight

**MVP Go/No-Go Criteria:** Proceed to Phase 2 if 5+ reports captured and Safety Officer actively using assignment workflow.

### Growth Features (Phase 2: "Analyze & Learn")

- Email notifications for new incidents and assignments
- Incident library with search functionality
- Basic dashboard with statistics (by week/month/location/severity)
- Dedicated views for Safety Officer and Managers
- Lessons learned documentation

### Vision (Phase 3+: "Predict & Prevent")

- AI-driven pattern detection and insights
- Per-employee analytics (restricted access)
- Recognition program integration
- Advanced reporting and export
- Quality incidents module
- Multi-language support
- Speech-to-text for accessibility

---

## User Journeys

### Journey 1: Yossi - Breaking the Silence

Yossi has worked the production line for 8 years. He's seen forklifts nearly clip workers, spills that almost caused falls, and equipment that "looks wrong" but nobody talks about. Last month, his colleague Sami was out for 5 days after an accident everyone saw coming. Yossi felt guilty—he'd noticed the loose railing weeks before but didn't know who to tell.

One morning, the Safety Officer Avi announces a new way to report safety issues. "Just use your phone," Avi says, showing a simple form. "No login, no password, no app to install—just open the link and report." Yossi is skeptical—he's not good with apps and his Hebrew writing is slow. But when he sees there's no login and an anonymous option, something shifts.

That afternoon, Yossi spots a puddle near the loading dock that's been there for days. He pulls out his phone, opens the bookmarked link, taps "Report," selects "Near-miss" and "Loading Dock" from dropdowns, snaps a photo, and hits submit—all in under 2 minutes. He doesn't even need to type anything or remember a password. He chooses to stay anonymous this first time.

Two days later, he notices the puddle is gone and there's a new drainage cover. For the first time, Yossi feels like his voice matters. He starts reporting other things he's been silently worrying about for years. After a few successful reports, he starts entering his name—he's no longer afraid.

---

### Journey 2: Avi - From Chaos to Control

Avi never asked to be the Safety Officer—it came with his Floor Manager promotion. He genuinely cares about his team's safety, but he's drowning. He hears about incidents days later through gossip. He has no system, no records, no way to prove things are getting better or worse.

The morning after launching Safety First, Avi opens the app during his coffee break as part of his new daily routine. He sees a new incident: Yossi's photo of the puddle at the Loading Dock. He assigns it to Dana (the evening shift manager for that area) with one tap from his recent assignees, then sends her a quick message on the plant's WhatsApp group: "Dana, assigned you a safety incident—check the app when you can."

By Friday, Avi has triaged 3 incidents in under 10 minutes total. He can see what's pending, what's assigned, and what's resolved. When the Plant Manager asks "how's safety going?", Avi has actual data instead of vague reassurances.

---

### Journey 3: Dana - Owning the Fix

Dana manages the evening shift and takes pride in her team. When she sees Avi's WhatsApp message about an assigned incident, she's initially annoyed—another task on her plate. But when she opens the app and sees the photo of the puddle, she immediately knows the problem: the old drainage cover has been broken for months.

She talks to maintenance, gets the cover replaced, and marks the incident as "Resolved" with a note: "Replaced drainage cover - maintenance ticket #4521." The whole process takes her 15 minutes of actual work spread across 2 days.

When a similar puddle appears near another dock, Dana searches the incident list, finds her previous fix, and applies the same solution. She's no longer reinventing the wheel.

---

### Journey 4: Ronen - Seeing the Patterns

Ronen is the Plant Manager. He knows safety matters, but he's been flying blind. Once a month, he asks Avi "how's safety?" and gets vague answers. He suspects there are problems but can't prove it or prioritize investments.

After 3 months of Safety First, Ronen opens the dashboard (Phase 2) and sees something surprising: 60% of incidents happen during the night shift, and most are in the warehouse area. He schedules a meeting with the warehouse night shift supervisor to understand why.

The conversation reveals that the night shift has inadequate lighting—something nobody ever formally reported. Ronen approves a lighting upgrade. Three months later, warehouse incidents drop by half.

---

### Journey 5: Moshe - Keeping It Running

Moshe is the plant's IT guy. When Safety First launches, he's responsible for the initial setup: configuring the system, adding user emails, and making sure it works on everyone's devices.

A week after launch, Yossi comes to Moshe frustrated—his photo won't upload. Moshe quickly identifies the issue: Yossi's old Android phone has a slow data connection. He shows Yossi how to connect to the plant's WiFi, and the upload works instantly.

Moshe also handles onboarding new employees: adding their email to the system so they can receive assignments. When the HR department hires 3 new workers, Moshe adds them in 5 minutes. He rarely thinks about Safety First after the initial setup—which is exactly how he likes his systems.

---

### Journey Requirements Summary

| Journey | User Type | Reveals Requirements For |
|---------|-----------|-------------------------|
| **Breaking the Silence** | Yossi (Reporter) | **No login required**, simple mobile form, dropdowns/icons, photo upload, name field or anonymous option, minimal typing |
| **From Chaos to Control** | Avi (Safety Officer) | **Login required**, daily check routine, incident inbox/list, quick assignment with recent assignees, status tracking |
| **Owning the Fix** | Dana (Responder) | **Login required**, verbal/WhatsApp handoff (MVP), incident details view, resolution workflow, searchable history (Phase 2) |
| **Seeing the Patterns** | Ronen (Plant Manager) | **Login required**, dashboard with trends, location/time analytics (Phase 2) |
| **Keeping It Running** | Moshe (IT Admin) | **Login required**, manager account management (not all 50 employees), initial setup, device troubleshooting support |

---

## Web Application Specific Requirements

### Project-Type Overview

Safety First is a **Single Page Application (SPA)** designed as an internal enterprise tool for ~50 employees at a single industrial plant. The architecture prioritizes mobile-first responsive design, simplicity, and reliability on factory floor conditions (variable WiFi, older devices).

### Deployment Model

**Progressive Web Application (accessible via URL):**
- No app store installation required
- Employees access via browser bookmark or home screen shortcut
- Single codebase serves all devices (mobile, tablet, desktop)
- Updates deploy instantly—no user action needed

### Technical Architecture Considerations

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Architecture** | Single Page Application (SPA) | Smoother mobile experience, faster perceived performance, works better on slow WiFi |
| **SEO** | Not required | Internal enterprise app accessed via direct link/bookmark |
| **Real-time Updates** | Manual refresh (MVP) | Simplicity for MVP; real-time can be added in Phase 2 |
| **Offline Support** | Not required (MVP) | Can be considered for Phase 2 if factory WiFi proves unreliable |

### Browser Support Matrix

| Browser | Platform | Support Level |
|---------|----------|---------------|
| **Chrome** | Android, Windows, Mac | Full support (latest 2 versions) |
| **Safari** | iOS, Mac | Full support (latest 2 versions) |
| **Firefox** | Windows, Mac | Full support (latest 2 versions) |
| **Edge** | Windows | Full support (latest 2 versions) |
| **IE11** | Any | Not supported |

**Policy:** Evergreen browsers only. Users on outdated browsers will see a message suggesting they update.

### Responsive Design Requirements

| Breakpoint | Target Devices | Priority |
|------------|----------------|----------|
| **Mobile (< 768px)** | Smartphones (primary reporting device) | **Highest** - Primary design target |
| **Tablet (768px - 1024px)** | iPads, Android tablets | Medium - Should work well |
| **Desktop (> 1024px)** | Laptops, desktops (Safety Officer, Plant Manager) | Medium - Dashboard and list views |

**Mobile-First Approach:**
- Design for mobile first, then scale up
- Touch-friendly tap targets (minimum 44x44px)
- Thumb-friendly button placement
- No hover-dependent interactions

### Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Initial Load** | < 3 seconds on 3G | Factory floor may have slow connections |
| **Time to Interactive** | < 5 seconds | Users need to report quickly |
| **Photo Upload** | Works on slow connections | Essential for incident documentation |
| **Lighthouse Performance** | > 70 | Reasonable baseline for internal tool |

### Accessibility Level

| Requirement | MVP Scope | Future Consideration |
|-------------|-----------|----------------------|
| **Hebrew RTL** | Full support | - |
| **Simple Language** | Yes - minimal jargon | - |
| **Large Touch Targets** | Yes - 44px minimum | - |
| **Color Contrast** | Basic contrast (readable) | WCAG AA in Phase 2 |
| **Screen Reader** | Not required MVP | Consider for Phase 2 |
| **Keyboard Navigation** | Basic (forms work with keyboard) | Full support Phase 2 |

### Localization

| Aspect | MVP Scope |
|--------|-----------|
| **UI Language** | Hebrew only |
| **Text Direction** | RTL (Right-to-Left) |
| **Date Format** | DD/MM/YYYY (Israeli standard) |
| **Future Languages** | Multi-language support in Phase 3+ |

---

## Project Scoping & Risk Mitigation

### MVP Strategy Validation

**MVP Philosophy:** Problem-Solving MVP
- Focus: Solve the core problem (incidents not being reported/tracked) with minimal features
- Approach: Deliver a complete, working loop (Report → Assign → Resolve) before adding infrastructure complexity

**Scope Classification:** Simple MVP
- Small team (1-2 developers)
- Lean feature set
- Single-site deployment
- ~50 users
- No external service dependencies (no email service needed)

### MVP Boundaries Confirmed

| In MVP (Phase 1) | Out of MVP (Phase 2+) |
|------------------|----------------------|
| Incident reporting form | Email notifications |
| Anonymous option | Dashboard & statistics |
| Incident list view | Search functionality |
| Assignment workflow | Lessons learned documentation |
| Resolution tracking | Dedicated role-based views |
| Hebrew UI (RTL) | AI-driven insights |
| User management (IT Admin) | Per-employee analytics |
| Manual check + verbal handoff | Multi-language support |

**MVP Notification Approach:**
- Safety Officer checks app daily as part of morning routine (5 min)
- Assignment communicated via existing plant WhatsApp group or verbal handoff
- No external email service dependency = simpler deployment

**MVP Validation Gate:** Proceed to Phase 2 when:
- 5+ incidents reported within 3 months
- Safety Officer actively using assignment workflow daily
- At least 3 unique reporters

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Photo upload fails on slow WiFi | Medium | Medium | Allow report submission without photo; retry upload in background |
| Hebrew RTL layout issues | Low | Medium | Use RTL-friendly CSS framework; test on Hebrew devices early |
| Browser compatibility issues | Low | Low | Target evergreen browsers only; show upgrade message for old browsers |

**Adoption Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Employees don't report | Medium | High | Anonymous option; management encouragement; simplicity; visible follow-through on reports |
| Safety Officer forgets to check | Medium | Medium | Build into morning routine; visible bookmark; consider browser push notification (Phase 2) |
| Fear of blame persists | Medium | High | Anonymous by default option; no punitive actions for reporters; celebrate reporters |

**Resource Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Limited development resources | Medium | Medium | Lean MVP scope; no external dependencies |
| No dedicated IT support | Low | Low | Self-service design; Moshe handles initial setup only |
| Scope creep | Medium | Medium | Strict MVP boundaries; defer all "nice to have" to Phase 2 |

### Development Sequence Recommendation

1. **Foundation:** User authentication, basic UI shell, Hebrew RTL support
2. **Core Loop:** Incident form → List view → Assignment → Resolution
3. **Polish:** Photo upload, mobile optimization, error handling
4. **Admin:** User management for IT admin (Moshe)
5. **Launch:** Deploy, train Safety Officer, announce to employees

---

## Functional Requirements

### Incident Reporting (Public Access - No Login Required)

- FR1: Anyone with the application URL can submit a safety incident report from a mobile device or computer without logging in
- FR2: Reporter can select incident severity level (unknown, near-miss, minor, major, critical) with unknown as default
- FR3: Reporter can select incident location from a predefined list of plant areas
- FR4: Reporter can enter the date and time when the incident occurred
- FR5: Reporter can provide a text description of the incident
- FR6: Reporter can attach a photo to the incident report
- FR7: Reporter can optionally enter their name in a text field (leaving blank = anonymous)
- FR8: [Merged into FR7 - simplified to optional name field]
- FR9: System confirms successful report submission to the reporter
- FR9a: System pauses submissions after 15 reports/day with Hebrew message to contact Safety Officer (auto-resets at midnight, configurable via environment variable)

### Incident Management (Safety Officer - Login Required)

- FR10: Safety Officer can view a list of all reported incidents
- FR11: Safety Officer can sort the incident list by date (newest/oldest)
- FR12: Safety Officer can view full details of any incident including photo
- FR13: Safety Officer can see the current status of each incident (new, assigned, resolved)
- FR14: Safety Officer can assign an incident to a responsible manager
- FR15: Safety Officer can select from recently used assignees for quick assignment
- FR16: Safety Officer can enter a new assignee email address
- FR17: Safety Officer can view which incidents are pending assignment
- FR18: Safety Officer can view which incidents have been assigned but not resolved

### Incident Resolution (Responder - Login Required)

- FR19: Assigned manager can view incidents assigned to them
- FR20: Assigned manager can view full incident details including photo and assignment info
- FR21: Assigned manager can mark an incident as resolved
- FR22: Assigned manager can add resolution notes explaining what was done
- FR23: Assigned manager can view their resolution history

### User Management (IT Admin - Login Required)

- FR24: IT Admin can add new manager/admin users to the system (not production line employees)
- FR25: IT Admin can assign roles to users (Manager, Safety Officer, Plant Manager, IT Admin)
- FR26: IT Admin can remove users from the system
- FR27: IT Admin can view list of all users and their roles
- FR28: IT Admin can reset user passwords if needed

**Note:** User management is for authenticated roles only (~10-15 manager/admin accounts). Production line employees (~50) do not need accounts—they use public reporting.

### Authentication & Access

- FR29: Manager and admin users can log in to the system with their credentials
- FR30: System restricts management features based on authenticated user role
- FR31: Anyone (authenticated or not) can submit incident reports via the public reporting form
- FR32: [REMOVED - reporters do not have accounts, cannot view history without login]
- FR33: Managers (authenticated) can view/resolve incidents assigned to them
- FR34: Safety Officer (authenticated) can view/manage all incidents
- FR35: Plant Manager (authenticated) can view all incidents and their statuses (read-only)
- FR36: IT Admin (authenticated) can access user management functions

**Access Model Summary:**

| Feature | Public Access | Authenticated Access |
|---------|---------------|---------------------|
| Submit incident report | ✓ Anyone | ✓ Also available |
| View incident list | ✗ | ✓ Manager+ roles |
| Assign incidents | ✗ | ✓ Safety Officer |
| Resolve incidents | ✗ | ✓ Assigned Manager |
| Manage users | ✗ | ✓ IT Admin only |

### Data Display & Interface

- FR37: System displays all text in Hebrew with right-to-left layout
- FR38: System displays dates in DD/MM/YYYY format
- FR39: System provides touch-friendly interface for mobile devices
- FR40: System shows visual indicator for incident severity levels
- FR41: System shows visual indicator for incident status

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| **Page Load Time** | < 3 seconds on 3G mobile network | Factory floor may have slow connections |
| **Time to Interactive** | < 5 seconds | Users need to report quickly before returning to work |
| **Form Submission** | < 2 seconds response | Immediate feedback for reporter |
| **Photo Upload** | Completes in background; form submittable without waiting | Don't block report submission |
| **Incident List Load** | < 2 seconds for Safety Officer | Quick daily triage workflow |
| **Concurrent Users** | Support 10 simultaneous users | Peak usage unlikely to exceed this |

### Security

| Requirement | Description |
|-------------|-------------|
| **Public Reporting Protection** | Daily limit of 15 reports; configurable; auto-resets at midnight |
| **Authentication** | Manager/admin users must authenticate before accessing management features |
| **Password Storage** | Passwords stored using industry-standard hashing (bcrypt or similar) |
| **Session Management** | Sessions expire after 24 hours of inactivity |
| **Anonymous Protection** | Anonymous reports must not store or log any identifying information about the reporter |
| **Data Encryption** | All data transmitted over HTTPS |
| **Role Enforcement** | Authenticated users can only access data and functions permitted by their role |
| **Photo Privacy** | Photos stored securely; only accessible to authorized roles |

### Reliability

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| **Availability** | 99% uptime (allows ~7 hours downtime/month) | Internal tool, not mission-critical |
| **Maintenance Window** | Planned downtime during nights/weekends acceptable | Low usage outside work hours |
| **Data Durability** | No incident data loss | Critical for accountability and trends |
| **Graceful Degradation** | If photo upload fails, report can still be submitted | Don't block core functionality |
| **Error Messaging** | Clear Hebrew error messages when something fails | Users understand what went wrong |

### Maintainability

| Requirement | Description |
|-------------|-------------|
| **Code Quality** | Clean, documented code for future maintenance |
| **Deployment** | Simple deployment process (single developer can deploy) |
| **Configuration** | Plant locations configurable without code changes |
| **Logging** | Basic logging for troubleshooting (no sensitive data in logs) |

