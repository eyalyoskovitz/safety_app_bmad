---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: 'product-brief'
lastStep: 5
project_name: 'safety_app_bmad'
user_name: 'Eyaly'
date: '2025-12-16'
---

# Product Brief: Safety First

**Date:** 2025-12-16
**Author:** Eyaly

---

## Executive Summary

**Safety First** is a web-based safety incident management application designed for industrial plant environments. The application addresses a critical gap: safety incidents that go unreported, untracked, and unresolved - leading to preventable injuries and financial losses.

Built for a single-site operation with approximately 50 employees, Safety First enables any employee to report safety incidents (including near-misses) from any mobile phone or laptop. Reports capture essential details including location, time, description, severity level, and optional photos - with an anonymous reporting option to encourage participation without fear of blame.

The application empowers the Safety Officer to assign incidents to responsible managers with due dates, while providing leadership with real-time dashboards, trend analytics, and AI-driven insights to identify patterns and prevent future incidents. A searchable incident library ensures lessons learned are captured and accessible.

**Target Outcomes (6 months):** 5+ incidents reported, 3+ lessons learned with implemented fixes, measurable improvement in safety culture.

---

## Core Vision

### Problem Statement

At industrial plants, safety incidents frequently go unreported due to the absence of clear processes, dedicated tools, and a culture that may associate reporting with blame. When incidents occur, they spread only through word of mouth - leaving no record, no accountability, and no opportunity for systematic improvement.

### Problem Impact

The consequences are both human and financial:
- **Human Cost:** Employee injuries requiring recovery time (e.g., 5 days sick leave from recent incident)
- **Financial Cost:** Damaged or destroyed product of significant value
- **Cultural Cost:** Employees remain exposed to preventable risks; managers lack visibility into safety issues

### Why Existing Solutions Fall Short

Currently, there is no formal reporting mechanism - incidents are communicated informally, if at all. This results in:
- No historical record for pattern analysis
- No clear ownership or accountability
- No lessons learned captured
- Fear of blame discourages reporting

### Proposed Solution

**Safety First** - a web application accessible from any device that:
1. **Captures** incidents with structured data (who, where, when, what, severity, photos)
2. **Routes** incidents to responsible managers via the Safety Officer
3. **Tracks** progress with due dates and resolution status
4. **Analyzes** patterns through dashboards and AI-driven insights
5. **Preserves** knowledge in a searchable incident library

### Key Differentiators

| Differentiator | Value |
|----------------|-------|
| **Anonymous Reporting Option** | Removes fear barrier, increases reporting rates |
| **Severity Classification** | Captures near-misses - the gold standard for prevention |
| **AI-Driven Insights** | Identifies patterns humans might miss (time, location, shifts) |
| **Per-Employee Analytics** | Restricted-access analysis for authorized managers |
| **Built for Your Context** | Tailored to your plant's workflow, not generic enterprise software |

---

## Target Users

### Primary Users

#### 1. The Reporter - "Yossi" (Production Line Worker)

**Profile:**
- Role: Production line worker, 8 years at the plant
- Tech comfort: Uses smartphone daily for WhatsApp/Facebook, but not tech-savvy
- Language: Hebrew is second language, struggles with written Hebrew
- Device: Personal smartphone (Android)

**Problem Experience:**
- Has witnessed several near-misses but never reported them
- Doesn't know who to tell or how to escalate
- Worried that reporting might point blame at him or his colleagues
- Has seen incidents "swept under the rug" before

**What Success Looks Like:**
- Can report an incident in under 2 minutes from his phone
- Simple form with dropdowns, icons, and minimal typing
- Feels safe using anonymous option when needed
- Sees that his reports actually lead to changes

**Design Implications:**
- Mobile-first, thumb-friendly UI
- Heavy use of icons, dropdowns, and predefined options
- Minimal free-text (optional description field)
- Hebrew with simple language; consider future multi-language support
- Speech-to-text for description (future enhancement)

---

#### 2. The Safety Officer - "Avi" (Floor Manager)

**Profile:**
- Role: Floor Manager + newly appointed Safety Officer (dual role)
- Tech comfort: Comfortable with basic apps, uses laptop and phone
- Challenge: Hands are full managing the floor - very limited time for safety tasks

**Problem Experience:**
- Hears about incidents through word of mouth, days after they happen
- No system to track what's been addressed vs. what's pending
- Feels responsible but lacks tools and time to be effective

**What Success Looks Like:**
- Gets notified immediately when incidents are reported
- Can review and assign incidents in under 1 minute each
- Clear dashboard showing what's pending, assigned, and resolved
- Doesn't need to chase managers for updates

**Design Implications:**
- Push notifications for new incidents
- One-tap assignment to managers (dropdown selection)
- Due date auto-suggested (editable)
- Status tracking without manual follow-up

---

#### 3. The Incident Responder - "Dana" (Shift Manager)

**Profile:**
- Role: Shift Manager, responsible for evening shift team of 12
- Tech comfort: Uses phone and laptop regularly
- Responsibility: Handles assigned incidents in her area

**Problem Experience:**
- Currently hears about problems informally, often incomplete information
- No clear ownership or accountability
- Sometimes the same issues repeat because fixes aren't documented

**What Success Looks Like:**
- Receives clear incident details with photos when assigned
- Knows exactly what's expected and by when (due date)
- Can mark incidents as resolved with notes
- Can search past incidents to see if similar issues were solved before

**Design Implications:**
- Email/push notification on assignment
- Clear incident detail view with all information
- Simple status update workflow (In Progress → Resolved)
- Access to searchable incident library

---

### Secondary Users

#### Plant Manager - "Ronen"

**Profile:**
- Role: Plant Manager, overall responsibility for operations and safety
- Tech comfort: Comfortable with dashboards and reports
- Focus: Big picture trends, not individual incidents

**Needs:**
- Weekly/monthly dashboard with key metrics
- Trend analysis (are incidents increasing or decreasing?)
- Insights on problem areas (locations, times, types)
- Per-employee analysis (restricted, for identifying training needs)

**Design Implications:**
- Executive dashboard view
- Exportable reports
- AI-driven insights prominently displayed
- Restricted access controls for sensitive analytics

---

### User Journey

| Stage | Yossi (Reporter) | Avi (Safety Officer) | Dana (Responder) | Ronen (Plant Mgr) |
|-------|------------------|---------------------|------------------|-------------------|
| **Discovery** | Training session + procedure rollout | Part of role assignment | Manager meeting | Leadership briefing |
| **Onboarding** | 5-min demo, bookmark on phone | Brief walkthrough of dashboard | Email with login + quick guide | Dashboard tour |
| **First Use** | Reports a near-miss, sees confirmation | Reviews report, assigns to Dana | Receives notification, views details | Checks dashboard after 1 week |
| **Aha Moment** | Sees his report led to a fix | Assigns incident in 30 seconds | Finds past incident solution in library | Spots pattern: night shift issues |
| **Routine** | Reports incidents as they happen | Daily 5-min triage of new reports | Handles assigned incidents weekly | Weekly dashboard review |
| **Recognition** | Gets acknowledged for proactive reporting | Presents improving metrics to leadership | Team recognized for quick resolution | Celebrates "days since incident" milestone |

---

## Success Metrics

### User Success Metrics

| User | Success Metric | Target |
|------|----------------|--------|
| **Yossi (Reporter)** | Time to submit incident report | ≤ 5 minutes |
| **Yossi (Reporter)** | Report completion rate | Form is simple enough that started reports get submitted |
| **Avi (Safety Officer)** | Time to triage and assign incident | ≤ 5 minutes |
| **Avi (Safety Officer)** | Daily triage completion | All new incidents reviewed same day |
| **Dana (Responder)** | Time to acknowledge assignment | Within 24 hours |
| **Dana (Responder)** | Access to relevant past incidents | Can find similar incidents in < 2 minutes |
| **Ronen (Plant Manager)** | Dashboard insight value | Identifies at least 1 actionable pattern per month |

---

### Business Objectives

| Objective | Measurement | Target | Timeframe |
|-----------|-------------|--------|-----------|
| **Build Reporting Culture** | Total incidents reported (incl. near-misses) | 5+ reports | First 6 months |
| **Capture Learnings** | Lessons learned documented with fixes | 3+ | First 6 months |
| **Reduce Incidents** | Incident frequency trend | Decreasing trend | After baseline (6+ months) |
| **Reduce Safety Costs** | Sick days from safety incidents | Decreasing trend | After baseline |
| **Reduce Safety Costs** | Product loss from safety incidents | Decreasing trend | After baseline |
| **Prevent Repeat Incidents** | Incidents at same location/cause | Zero repeat incidents | Ongoing |
| **Employee Participation** | % of employees who reported at least once | Growing month-over-month | Ongoing |

---

### Key Performance Indicators

**Leading Indicators (predict future success):**

| KPI | Why It Matters | Target |
|-----|----------------|--------|
| Near-miss ratio | High ratio = catching issues before injury | > 50% of reports are near-misses |
| Time to first report | Early adoption signal | First report within 1 week of launch |
| Anonymous vs. named ratio | Trust indicator - named should increase over time | Track trend |
| Reports per employee | Broad participation vs. few super-reporters | Spread across workforce |

**Lagging Indicators (confirm success):**

| KPI | Why It Matters | Target |
|-----|----------------|--------|
| Days since last major incident | Ultimate safety measure | Increasing streak |
| Average resolution time | Accountability measure | Decreasing trend |
| Repeat incident rate | Shows fixes are working | 0% |
| Safety-related costs | Financial impact | Decreasing trend |

---

### Recognition Program

| Recognition | Criteria | Reward |
|-------------|----------|--------|
| **Prime Contributor** | Top reporter (quantity + quality of reports) | Salary bonus |
| **Quick Responder** | Fastest average resolution time | Acknowledgment |
| **Pattern Spotter** | Report that led to systemic fix | Acknowledgment |

---

## MVP Scope

### Core Features (Phase 1 - "Report & Assign")

| Feature | Description |
|---------|-------------|
| **Incident Reporting Form** | Simple form: severity (near-miss/minor/major/critical), location, date/time, description, optional photo upload |
| **Anonymous Option** | Toggle to submit without reporter name |
| **Incident List** | Simple list view, sortable by date - serves as Safety Officer's inbox |
| **Assignment** | Safety Officer assigns incident to a Manager from the list |
| **Resolution** | Manager marks incident as resolved with optional notes |
| **Roles** | Reporter (all employees) and Manager (Safety Officer, Shift Managers, Plant Manager) |
| **Notifications** | Email/push to Safety Officer on new incident; Email/push to Manager on assignment |
| **Language** | Hebrew UI with simple language |

### Out of Scope for MVP

| Feature | Phase | Rationale |
|---------|-------|-----------|
| Incident library with search | Phase 2 | List view sufficient until more data exists |
| Dashboard & statistics | Phase 2 | Need baseline data first |
| Dedicated Safety Officer view | Phase 2 | List view sufficient for MVP |
| Dedicated Manager view | Phase 2 | List view sufficient for MVP |
| AI-driven insights | Phase 3+ | Requires data accumulation |
| Per-employee analytics | Phase 3+ | Requires data + privacy controls |
| Recognition features | Phase 3+ | Focus on core loop first |
| Quality incidents module | Phase 3+ | Prove safety value first |
| Speech-to-text | Phase 3+ | UX enhancement, not essential |
| Multi-language support | Phase 3+ | Hebrew sufficient for launch |
| Export/reports | Phase 3+ | Dashboard first |
| Regulatory/compliance | Phase 3+ | Future consideration |

### MVP Success Criteria

| Criteria | Target | Decision |
|----------|--------|----------|
| First incident reported | Within 1 week of launch | Validates adoption |
| Total incidents captured | 5+ in 6 months | Validates utility |
| Assignment rate | 100% assigned within 24 hours | Validates workflow |
| Resolution tracking | All incidents have status | Validates accountability |
| Unique reporters | 10+ in 6 months | Validates broad adoption |

**Go/No-Go for Phase 2:** Proceed if MVP achieves 5+ reports and Safety Officer is actively using assignment workflow.

### Future Vision

**Phase 2 - "Analyze & Learn"**
- Incident library with search functionality
- Basic dashboard with statistics (by week/month/location/severity)
- Dedicated views for Safety Officer and Managers
- Lessons learned documentation

**Phase 3 - "Predict & Prevent"**
- AI-driven pattern detection and insights
- Per-employee analytics (restricted access)
- Recognition program integration
- Advanced reporting and export

**Long-term Vision**
- Quality incidents module (unified platform for safety + quality)
- Multi-language support for diverse workforce
- Speech-to-text for accessibility
- Regulatory compliance features
- Integration with plant systems (if applicable)

---
