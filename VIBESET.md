# VibeSet — Project Memory

## Overview
- **Name**: VibeSet
- **Type**: Workout tracking web app (Setgraph clone)
- **Repo**: https://github.com/kjaintech25/SetGraph
- **Owner**: Kush (kjaintech25)
- **Status**: v1.0.0 — Core features working, UI polished

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Lucide-react
- **Charts**: Recharts
- **Build**: Vite 6
- **Persistence**: localStorage (no backend)
- **Deployment**: Local dev (npm run dev)

## Key Decisions

### Why AI was removed
- User (Kush) explicitly requested removing Gemini/AI features
- Focus is on core workout logging, not AI coaching
- Simplifies the codebase significantly

### Why Setgraph-style UI
- User wants 1:1 clone of Setgraph app aesthetic
- Minimal, compact, dark theme with green accent
- Small text, tight spacing, no bulky cards
- Real-time feedback ("Compared to Previous") is core feature

### Why Body Tab hidden
- Full exercise library browser not needed yet
- Code preserved for future implementation
- Currently 3-tab nav: Sets, Sessions, Today

## Current Architecture

### File Structure
```
setgraph-clone/
├── App.tsx          — Main app (all UI in one file)
├── types.ts         — TypeScript interfaces
├── constants.tsx    — Exercise library, accent colors
├── index.tsx        — Entry point
├── index.html       — HTML template
├── package.json     — Dependencies
├── vite.config.ts   — Vite config
├── tsconfig.json    — TypeScript config
├── PRD.md           — Product requirements
└── VIBESET.md       — This file (project memory)
```

### State Management
- All state in App.tsx using React hooks
- No external state management (no Redux, Zustand, etc.)
- localStorage for persistence (sessions, templates, settings, custom exercises)

### Key State Variables
- `sessions` — Array of completed workout sessions
- `currentSession` — Active workout session (null if not working out)
- `templates` — Saved workout templates
- `exercises` — Full exercise library (default + custom)
- `settings` — Theme, units, accent color, rest duration
- `activeTab` — Current navigation tab (sets | sessions | today)

### Important Patterns

**React Hooks Rules** (learned the hard way):
- Hooks must be at top level of component, NOT inside nested functions
- Hooks must run every render, NOT after conditional returns
- Fixed bugs: useMemo inside renderBody(), useMemo after if (!isOpen) in ExercisePicker

**localStorage Keys**:
- `vibeset_sessions` — Workout sessions
- `vibeset_templates` — Workout templates
- `vibeset_settings` — User settings
- `vibeset_custom_exercises` — Custom exercises

## Navigation Logic

### Tab Navigation (Bottom Nav)
- **Sets**: Main workout logging view
- **Sessions**: Session history list
- **Today**: Weekly view + calendar expand
- ~~Body~~: Hidden (future feature)

### VibeSet Logo Click
- If on Sets tab with active workout → go back to "My Workouts" screen
- If on other tab with active workout → go to Sets tab (view workout)
- If no active workout → go to Sets tab (home)

## UI Style Guide

### Colors
- **Background**: `bg-zinc-950` (near black)
- **Cards**: `bg-zinc-800/30`, `bg-zinc-800/50`
- **Accent**: `emerald-500` (default), customizable in settings
- **Text**: `text-zinc-100` (primary), `text-zinc-400` (secondary), `text-zinc-600` (muted)
- **Borders**: `border-zinc-800/50`

### Typography
- **Headers**: `text-lg font-bold text-zinc-100`
- **Labels**: `text-[10px] text-zinc-500 uppercase font-semibold tracking-wider`
- **Values**: `text-sm font-semibold text-zinc-200`

### Spacing
- **Padding**: `p-3`, `p-4` (compact)
- **Gaps**: `gap-1`, `gap-2` (tight)
- **Rounded**: `rounded-xl` (not overly rounded)
- **Nav height**: Compact, `py-1`

## Known Issues & Gotchas

1. **No backend** — All data is local, lost if localStorage cleared
2. **No auth** — Single user, no login
3. **No undo** — Deleting sessions/sets is permanent
4. **No offline indicator** — Works offline (localStorage), but no visual indicator
5. **Single file** — All UI in App.tsx (could be split into components later)

## Running the Project

```bash
cd "/Users/kushjain/Desktop/Voding szn 1/Setgraph/setgraph-clone"
npm_config_cache=/tmp/npm-cache npm install  # First time only
npm run dev
# Open http://localhost:3001 (or whatever port Vite picks)
```

## Git Workflow
- Main branch: `main`
- Remote: https://github.com/kjaintech25/SetGraph
- Commit after each feature/fix
- Push to remote after significant changes

## Future Work (from PRD)
- Plate calculator
- Exercise-specific analytics
- Notes on sets/exercises
- Body Tab (exercise library browser)
- Supersets
- Cloud sync
- Export data (CSV/JSON)
