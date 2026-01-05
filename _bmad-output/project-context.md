---
project_name: 'Safety First'
user_name: 'Eyaly'
date: '2025-12-27'
last_updated: '2025-12-29'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'code_quality', 'critical_rules']
status: 'complete'
notes: 'Updated to reflect latest stable versions (React 19, MUI 7, Vite 7, React Router 7)'
---

# Project Context for AI Agents

This file contains critical rules that AI agents MUST follow when implementing code for Safety First. Read this BEFORE writing any code.

---

## CRITICAL: Token Efficiency Rules

**ALWAYS minimize token usage without compromising quality:**

- Read files once, reuse in memory
- Batch operations (parallel tool calls when possible)
- Concise responses - ask "need details?" instead of explaining everything
- Give one recommendation + alternative titles only (not full descriptions)
- Short status updates, not narratives
- Load data once, not multiple times
- Execute in batches, not sequentially unless required

---

## Technology Stack (Use These Exact Versions)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 7.x | Build tool |
| MUI | 7.x | Component library |
| Supabase JS | 2.x | Backend client |
| React Router | 7.x (Library Mode) | Routing |

**Note:** We use the latest stable versions (as of Dec 2025) for better security, performance, and long-term support. React Router 7 is configured in Library Mode for v6-compatible API.

---

## CRITICAL: Hebrew RTL Rules

**NEVER forget these - they affect EVERY component:**

- Set `dir="rtl"` on root element
- MUI theme MUST include `direction: 'rtl'`
- Use `marginInlineStart`/`marginInlineEnd` NOT `marginLeft`/`marginRight`
- Icons that imply direction (arrows) must be flipped
- Text alignment defaults to right

---

## CRITICAL: Date Format Rules

| Context | Format | Example |
|---------|--------|---------|
| Display | DD/MM/YYYY | 27/12/2025 |
| Time | 24-hour | 14:30 |
| Database | ISO 8601 | 2025-12-27T14:30:00Z |

**WRONG:** `12/27/2025` (American format)
**RIGHT:** `27/12/2025` (Israeli format)

---

## CRITICAL: Anonymous Reporting

When `is_anonymous = true`:
- `reporter_id` MUST be `null`
- NEVER log user ID, IP address, or any identifying info
- NEVER add `created_by` audit fields
- Display "דיווח אנונימי" (Anonymous Report) in UI

---

## Database Naming Rules

| Element | Pattern | Example |
|---------|---------|---------|
| Tables | lowercase, plural, snake_case | `incidents`, `users` |
| Columns | lowercase, snake_case | `created_at`, `is_anonymous` |
| Booleans | `is_` or `has_` prefix | `is_resolved`, `has_photo` |

**WRONG:** `Users`, `userId`, `createdAt`
**RIGHT:** `users`, `user_id`, `created_at`

---

## Code Naming Rules

| Element | Pattern | Example |
|---------|---------|---------|
| Components | PascalCase | `IncidentCard` |
| Files | Match component | `IncidentCard.tsx` |
| Functions | camelCase | `getIncidents()` |
| Hooks | `use` prefix | `useIncidents()` |
| Constants | UPPER_SNAKE | `MAX_PHOTO_SIZE` |

---

## File Organization Rules

```
src/features/{feature}/     ← Feature-specific code lives HERE
src/components/             ← ONLY shared components
src/hooks/                  ← ONLY shared hooks
src/lib/                    ← Utilities, Supabase client
```

**Rule:** If a component is used by ONE feature only, it goes in that feature's folder.

---

## Error Messages: Hebrew Only

| Error Code | Hebrew Message |
|------------|----------------|
| NETWORK_ERROR | אין חיבור לאינטרנט |
| AUTH_REQUIRED | נדרשת התחברות |
| FORBIDDEN | אין הרשאה לפעולה זו |
| NOT_FOUND | הפריט לא נמצא |
| VALIDATION_ERROR | נתונים לא תקינים |
| UPLOAD_FAILED | העלאת התמונה נכשלה |

**NEVER show English error messages to users.**

---

## Supabase Query Patterns

```typescript
// CORRECT pattern
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .eq('status', 'new')

// ALWAYS check for errors
if (error) {
  // Handle with Hebrew message
}
```

---

## Loading State Naming

```typescript
isLoading      // Generic
isSubmitting   // Form submission
isUploading    // File upload
isFetching     // Data fetch
```

---

## Component Props Pattern

```typescript
// ALWAYS define interface
interface IncidentCardProps {
  incident: Incident
  onSelect?: (id: string) => void  // Callbacks use 'on' prefix
}

export const IncidentCard: FC<IncidentCardProps> = ({ ... }) => {
  // Implementation
}
```

---

## Anti-Patterns to AVOID

| DON'T | DO |
|-------|-----|
| `margin-left: 10px` | `margin-inline-start: 10px` |
| `MM/DD/YYYY` | `DD/MM/YYYY` |
| English errors | Hebrew errors |
| `Users` table | `users` table |
| Store reporter for anonymous | Set `reporter_id = null` |
| Import between features | Use shared components |

---

## Development Server Management

**CRITICAL: Always verify dev server is stopped after testing**

When running `npm run dev` for testing, you MUST verify it's stopped afterward:

```bash
# After testing, verify port 5173 is closed:
netstat -ano | grep -E ":5173"

# If port is still open, kill the process:
# On Windows (Git Bash/MinGW):
taskkill //F //PID <process_id>

# On Linux/Mac:
kill -9 <process_id>

# Final verification (should return nothing):
netstat -ano | grep -E ":5173"
ps aux | grep -i "vite" | grep -v grep
```

**Why this matters:**
- Open dev servers are security risks if left unattended
- Multiple dev servers cause port conflicts
- Consumes system resources unnecessarily

**Best Practice:**
- Run dev server only when needed
- Always verify it's stopped before ending session
- Use background process management carefully

---

## Quick Reference

- **Language:** Hebrew (RTL)
- **Date:** DD/MM/YYYY
- **Time:** 24-hour
- **Errors:** Hebrew in Snackbar
- **Auth:** Supabase + RLS
- **Photos:** Supabase Storage
- **Anonymous:** reporter_id = null
- **Dev Server Port:** 5173 (Vite default)

---

## Related Documents

- **Full Architecture:** `_bmad-output/architecture.md`
- **PRD:** `_bmad-output/prd.md`
- **UX Specification:** `_bmad-output/ux-design-specification.md`
