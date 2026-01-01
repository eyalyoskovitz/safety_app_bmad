# Safety First - קודם בטיחות

Hebrew RTL safety incident reporting system for manufacturing plants.

## Overview

Safety First is a mobile-first web application that enables production line employees to quickly report safety incidents, and allows safety officers and managers to track, assign, and resolve these incidents.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **Supabase account** (for database and authentication)

## Tech Stack

- **React 18** + **TypeScript 5** - UI framework with type safety
- **Vite 5** - Fast build tool and dev server
- **MUI 5** - Material-UI component library
- **Supabase** - Backend (database, auth, storage)
- **React Router 6** - Client-side routing

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd safety_app_bmad/safety-first
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 18, TypeScript 5, Vite 5
- MUI (@mui/material, @mui/icons-material, @emotion)
- Supabase client (@supabase/supabase-js)
- React Router (react-router-dom)

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DAILY_REPORT_LIMIT=15
```

**Where to find Supabase credentials:**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 4. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173/`

### 5. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Project Structure

```
safety-first/
├── src/
│   ├── features/          # Feature-specific code
│   │   ├── auth/          # Authentication features
│   │   ├── incidents/     # Incident reporting and management
│   │   └── users/         # User management
│   ├── components/        # Shared/reusable components only
│   ├── hooks/             # Shared custom hooks
│   ├── lib/               # Utilities and Supabase client
│   │   └── supabase.ts    # Supabase client configuration
│   ├── theme/             # MUI theme configuration
│   ├── App.tsx            # Root component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── .env.example           # Environment variables template
├── .env.local            # Your local environment variables (not in git)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## Key Features

### Public Access
- **Anonymous Incident Reporting** - No login required for production line employees
- **Photo Capture** - Camera-first experience on mobile devices
- **Hebrew RTL Interface** - Right-to-left layout throughout

### Authenticated Features (Managers & Admins)
- **Incident Management** - View, sort, filter, and assign incidents
- **Resolution Workflow** - Track incident resolution with notes
- **User Management** - Manage manager and admin accounts
- **Role-Based Access** - Different permissions for different roles

## Development Guidelines

### Naming Conventions

- **Components**: PascalCase (`IncidentCard.tsx`)
- **Functions**: camelCase (`getIncidents()`)
- **Hooks**: `use` prefix (`useIncidents()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PHOTO_SIZE`)
- **Database**: snake_case (`created_at`, `is_resolved`)

### File Organization

- **Feature-specific code** goes in `src/features/{feature}/`
- **Shared components** go in `src/components/`
- **Shared hooks** go in `src/hooks/`
- If a component is used by ONE feature only, keep it in that feature's folder

### Critical Rules

- All UI text in **Hebrew** (RTL)
- Dates displayed as **DD/MM/YYYY** (Israeli format)
- Use `marginInlineStart`/`marginInlineEnd` instead of `marginLeft`/`marginRight`
- Environment variables must be prefixed with `VITE_`
- Anonymous reports: `reporter_id = null` (no PII stored)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `VITE_DAILY_REPORT_LIMIT` | Max reports per day | `15` |

## Troubleshooting

### Dev server won't start
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for port conflicts (default: 5173)

### Missing environment variables error
- Make sure `.env.local` exists and contains all required variables
- Verify variables are prefixed with `VITE_`
- Restart dev server after changing environment variables

### TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` is not corrupted
- Clear TypeScript cache: delete `node_modules/.vite` folder

## Related Documentation

- [Project PRD](./_bmad-output/prd.md)
- [Architecture Document](./_bmad-output/architecture.md)
- [UX Design Specification](./_bmad-output/ux-design-specification.md)
- [Project Context for AI Agents](./_bmad-output/project-context.md)

## License

[Specify your license]

## Contact

[Specify contact information or issue tracker]
