# Safety First - קודם בטיחות

A Hebrew RTL mobile-first web application for reporting and managing safety incidents in industrial manufacturing plants.

## Features

- **Anonymous Reporting** - Report incidents without login or identification
- **Near-Miss Capture** - Track preventive safety events
- **Photo Capture** - Camera-first experience on mobile
- **Role-Based Access** - Managers, safety officers, and admins
- **Full Hebrew RTL** - Right-to-left interface throughout

## Tech Stack

React 19 | TypeScript | Vite | MUI 7 | Supabase | React Router 7

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_DAILY_REPORT_LIMIT` | Max reports per day (default: 15) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run build:ghpages` | Build for GitHub Pages |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── features/        # Feature modules (auth, incidents, users)
├── components/      # Shared components
├── hooks/           # Shared hooks
├── lib/             # Utilities & Supabase client
└── theme/           # MUI theme config
```

## User Roles

| Role | Access |
|------|--------|
| Public | Submit reports (anonymous optional) |
| Manager | View/resolve assigned incidents |
| Safety Officer | View all, assign to managers |
| IT Admin | Full access + user management |

## Documentation

- [User Guide](./docs/user-guide/README.md)
- [PRD](../_bmad-output/prd.md)
- [Architecture](../_bmad-output/architecture.md)
