---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
status: 'complete'
completedAt: '2025-12-27'
inputDocuments:
  - _bmad-output/prd.md
  - _bmad-output/analysis/product-brief-safety_app_bmad-2025-12-16.md
workflowType: 'ux-design'
lastStep: 14
project_name: 'safety_app_bmad'
user_name: 'Eyaly'
date: '2025-12-27'
---

# UX Design Specification - Safety First

**Author:** Eyaly
**Date:** 2025-12-27

---

## UX Design Context

### Design-For User

**Yossi** (lowest tech comfort) - If it works for Yossi, it works for everyone.

### Access Model

| User Type | Access | Authentication |
|-----------|--------|----------------|
| **Anyone (Reporter)** | Submit incident reports | **None required** - public URL |
| **Managers/Admins** | View, assign, resolve incidents | Login required |

**Key Design Decision:** Reporters don't need accounts or login. They access a public URL, optionally enter their name (or stay anonymous), and submit. This removes the biggest friction point for adoption.

### Key UX Challenges

| Challenge | Design Implication |
|-----------|-------------------|
| **Zero-barrier reporting** | **No login required** - just open URL and report |
| **Ultra-simple reporting** | Dropdowns and photos over typing; complete in <2 min |
| **Trust through anonymity** | Anonymous toggle hides name field entirely |
| **Hebrew RTL mobile** | Large text, thumb-sized targets, proper RTL alignment |
| **Factory conditions** | Works on slow WiFi; usable with dirty/gloved hands |

### Design Opportunities

| Opportunity | Approach |
|-------------|----------|
| **Icons over text** | Reduce reading load for low-literacy users |
| **Photo-first** | Camera prominent; photo replaces typing |
| **Visible impact** | Show when issues get fixed—builds trust |
| **Radical simplicity** | Dead-simple beats feature-rich |

---

## Core User Experience

### Core Actions by Role

| Role | Core Action | Success Criteria | Auth Required |
|------|-------------|------------------|---------------|
| **Anyone (Reporter)** | Submit incident report | Complete in <2 min from phone | **No** |
| **Safety Officer** | Daily triage - spot new, assign | Complete in <5 min, nothing missed | Yes |
| **Assigned Manager** | See assignment, mark resolved | Know what's mine, close the loop | Yes |

### Effortless Interactions

| Interaction | Design Approach | Auth |
|-------------|-----------------|------|
| **Open report form** | Just open URL - no login screen | Public |
| **Enter name (optional)** | Text field, or toggle anonymous to hide it | Public |
| Severity selection | Big tap targets with icons | Public |
| Location selection | Dropdown, not free text | Public |
| Photo capture | One-tap camera access | Public |
| Submit report | One tap, immediate confirmation | Public |
| Spot new incidents | Clear "New" badge/count (no email = must be obvious) | Login |
| List scanning | Status visible at a glance with color coding | Login |
| Quick assignment | Recent assignees first, one-tap assign | Login |
| See my assignments | "Assigned to me" filter - obvious entry | Login |
| Mark resolved | One tap + optional note | Login |

### Experience Principles

1. **10-second rule** - Any screen understood in 10 seconds
2. **Tap, don't type** - Dropdowns, toggles, camera over keyboard
3. **Obvious next step** - Always clear what to do next
4. **Trust by simplicity** - Less UI = more trust

---

## UX Pattern Analysis & Inspiration

### Inspiring Products

| App | Why It Works | Applicable Pattern |
|-----|--------------|-------------------|
| **WhatsApp** | Factory workers already use it daily | Photo-first capture, minimal text input |
| **Waze** | One-tap hazard reporting while driving | Quick reporting without stopping workflow |
| **Google Forms** | Dead-simple sequential flow | One question at a time, clear progress |

### Transferable Patterns

| Pattern | Application |
|---------|-------------|
| **Camera as primary input** | Photo replaces long descriptions |
| **Preset options over typing** | Hazard type selection with icons |
| **Progressive disclosure** | Show only what's needed per role |
| **Bottom-sheet actions** | Thumb-friendly assignment UI |

### Anti-Patterns to Avoid

| Avoid | Why |
|-------|-----|
| Multi-field forms | Too complex for Yossi |
| Required text fields | Forces keyboard on factory floor |
| Settings/config screens | Adds confusion, reduces trust |

---

## Design System Foundation

### Design System: MUI (Material UI)

| Factor | Why MUI |
|--------|---------|
| **RTL Support** | Built-in RTL with `direction: 'rtl'` - critical for Hebrew |
| **Mobile-first** | Mature mobile components, touch-optimized |
| **Simplicity** | Familiar patterns workers may recognize from Android |
| **Accessibility** | WCAG compliance built-in |
| **Speed** | Fast dev with pre-built components |

### Implementation Approach

- Use MUI's `createTheme` with RTL configuration
- Large touch targets (48px minimum) via theme customization
- Minimal color palette (status colors + neutral)
- Key components: `BottomSheet`, `Select`, `IconButton`, `Fab`

---

## Defining Experience

### "Snap and Report" - The Core Interaction

**One sentence:** "See hazard → open link → photo → done in 60 seconds - NO LOGIN"

### Experience Mechanics

| Phase | What Happens | Design Implication |
|-------|--------------|-------------------|
| **Access** | Worker opens bookmarked URL | **No login screen** - straight to form |
| **Trigger** | Worker sees hazard | Report button prominent |
| **Capture** | One tap → camera opens | Camera is step 1, not step 3 |
| **Identity** | Enter name OR toggle anonymous | Text field, not account selection |
| **Context** | Select location + type | Pre-populated dropdowns, icons |
| **Confirm** | Review + submit | Single screen, big "Submit" |
| **Feedback** | "Report submitted" toast | Immediate confirmation, can close |

### Success Criteria

| Metric | Target |
|--------|--------|
| Time to submit | < 60 seconds |
| Taps required | ≤ 5 taps |
| Typing required | Zero (optional only) |

---

## Visual Design Foundation

### Color System

| Role | Color | Usage |
|------|-------|-------|
| **Primary** | Blue (#1976D2) | Actions, links, interactive |
| **Critical** | Red (#D32F2F) | Critical severity, errors |
| **High** | Orange (#F57C00) | High severity |
| **Medium** | Yellow (#FBC02D) | Medium severity |
| **Low** | Green (#388E3C) | Low severity, success, resolved |
| **Neutral** | Grey scale | Backgrounds, borders, text |

### Typography

| Element | Spec |
|---------|------|
| **Font** | System default (Roboto/SF Pro) |
| **Body** | 16px minimum |
| **Headers** | 20-24px, bold |
| **Touch labels** | 14px minimum |

### Spacing & Layout

| Principle | Value |
|-----------|-------|
| **Base unit** | 8px grid |
| **Touch targets** | 48px minimum |
| **Padding** | 16px standard, 24px cards |
| **Margins** | 16px screen edges |

---

## Design Direction: "Industrial Minimal"

### Layout Approach

| Aspect | Direction |
|--------|-----------|
| **Layout** | Single-column, card-based, no sidebars |
| **Density** | Spacious - one action per screen section |
| **Navigation** | Bottom tabs (3 max: Report, My Items, List) |
| **Visual Weight** | Light backgrounds, bold action buttons |
| **Interaction** | FAB for reporting, swipe for quick actions |

### Key UI Patterns

| Screen | Primary Pattern |
|--------|----------------|
| **Report Flow** | FAB → Form (with optional camera) |
| **Incident List** | Card list with status chips, pull-to-refresh |
| **Detail View** | Photo hero, metadata below, actions fixed bottom |
| **Assignment** | Bottom sheet with recent assignees + search |

---

## User Journey Flows

### Reporter: Submit Incident (PUBLIC - No Login)

```
[Open URL] → [Incident Form] → Submit → [Success Toast] → [Can Close Browser]
                  ↓ optional
               [Camera]
                  ↓ optional
            [Enter Name or Anonymous Toggle]
```

**Form Flow:** Photo (optional) → Location → Severity → Name/Anonymous → Description (optional) → Submit

**Key:** No login wall. Reporter can bookmark the URL and access anytime.

### Safety Officer: Daily Triage (LOGIN REQUIRED)

```
[Login Page] → [List - "New" filter] → Tap Card → [Detail] → Assign → [Assignee Sheet] → Done
```

### Manager: Resolve Assignment (LOGIN REQUIRED)

```
[Login Page] → [List - "My Items"] → Tap Card → [Detail] → Resolve → [Resolution Sheet] → Done
```

### Navigation & Landing

| User | Default View | Auth |
|------|--------------|------|
| Anyone (Reporter) | Report Form | None |
| Safety Officer | Incident List (New filter) | Login |
| Manager | Incident List (My Items filter) | Login |
| Plant Manager | Incident List (All, read-only) | Login |

**Public App:** Report form only (no navigation needed)

**Authenticated App:** Bottom Nav with List | My Items | (+ Report button in header)

---

## Two App Experiences

### Public Experience (Reporter)

| Aspect | Design |
|--------|--------|
| **Entry Point** | Direct URL - no login screen |
| **Primary Screen** | Incident Report Form |
| **Navigation** | None needed - single purpose |
| **Identity** | Name text field + Anonymous toggle |
| **After Submit** | Success toast, can close browser |
| **No Access To** | Incident list, history, management |

**Design Goal:** Absolute minimum friction. Open → Report → Done.

### Authenticated Experience (Managers)

| Aspect | Design |
|--------|--------|
| **Entry Point** | Login page (email/password) |
| **Primary Screen** | Incident List (filtered by role) |
| **Navigation** | Bottom nav: List, My Items |
| **Can Also Report** | Yes, via button in header |
| **Full Access To** | List, details, assign, resolve (per role) |

**Design Goal:** Efficient triage and resolution workflow.

---

## Component Strategy

### MUI Components (Use As-Is)

| Component | Usage |
|-----------|-------|
| `BottomNavigation` | Main app navigation |
| `Fab` | Report incident button |
| `Card` | Incident list items |
| `Select` | Location, Type dropdowns |
| `SwipeableDrawer` | Bottom sheets |
| `Chip` | Status badges |
| `Snackbar` | Toast notifications |

### Configured Components (MUI + Styling)

| Component | Customization |
|-----------|---------------|
| **IncidentCard** | Status chip, thumbnail, RTL layout |
| **SeverityPicker** | 4 colored icon buttons |
| **StatusChip** | Semantic colors per status |
| **AssigneeSheet** | Recent list + search |

---

## UX Consistency Patterns

### Feedback Patterns

| Situation | Pattern |
|-----------|---------|
| **Success** | Green Snackbar, auto-dismiss 3s |
| **Error** | Red Snackbar, requires dismiss |
| **Loading** | Circular spinner, centered |
| **Empty list** | Icon + message |

### Action Hierarchy

| Level | Style | Usage |
|-------|-------|-------|
| **Primary** | Contained, Primary color | Submit, Assign, Resolve |
| **Secondary** | Outlined | Cancel, Back |

### Form Patterns

| Pattern | Behavior |
|---------|----------|
| **Validation** | Inline errors, on blur |
| **Dropdowns** | Pre-select common option |
| **Photo** | Thumbnail preview, tap to remove |
| **Reporter Name** | Text input field (not from account) |
| **Anonymous Toggle** | When ON, hides name field entirely |
| **Daily Limit Message** | Hebrew message when 25 reports/day reached |

### List Patterns

| Pattern | Behavior |
|---------|----------|
| **Pull-to-refresh** | Spinner at top |
| **Tap card** | Navigate to detail |
| **New indicator** | Blue chip or dot |

---

## Responsive Design & Accessibility

### Responsive Strategy

| Device | Approach |
|--------|----------|
| **Mobile** | Primary target, full design |
| **Tablet** | Same layout, larger targets |
| **Desktop** | Wider content area only |

**Mobile-first:** No desktop-specific features in MVP.

### Accessibility (WCAG AA)

| Requirement | Implementation |
|-------------|----------------|
| **Contrast** | 4.5:1 minimum |
| **Touch targets** | 48px minimum |
| **RTL** | MUI RTL theme |
| **Labels** | Hebrew on all fields |
| **Focus** | Visible indicators |
