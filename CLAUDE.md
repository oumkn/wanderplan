# WanderPlan — CLAUDE.md

> Single source of truth. Read this before every session. Update it after every milestone.

---

## Project Overview

**WanderPlan** — AI-powered travel planner for couples and small groups.
User flow: Passport → Travel style → Dates/Budget → 6 AI destinations → Day-by-day itinerary → Budget → Save & Share

---

## Architecture

| Layer | Tech | Deploy |
|-------|------|--------|
| Frontend | Next.js 14 (App Router) + Tailwind + shadcn/ui | Vercel |
| Backend | Hono + Node.js | Railway |
| Database | Supabase (Postgres + Auth + RLS) | Supabase Cloud |
| AI | Claude API (claude-sonnet-4-20250514) | — |
| State | Zustand + localStorage persist | — |
| PDF | jspdf + jspdf-autotable | — |
| Monorepo | npm workspaces | — |

---

## Monorepo Structure

```
wanderplan/
  shared/          # Types, Zod schemas, constants
  backend/         # Hono API server
  frontend/        # Next.js app
  CLAUDE.md        # This file
```

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=          # Railway backend URL in prod, http://localhost:3001 locally
```

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=            # Used to verify user JWTs
SUPABASE_SERVICE_ROLE_KEY=    # Used for service role operations (bypasses RLS)
ANTHROPIC_API_KEY=
FRONTEND_URL=                 # Vercel URL in prod, http://localhost:3000 locally
PORT=3001
```

---

## Database

Schema is in `backend/src/db/migrations/001_initial.sql`.
Run in Supabase SQL editor on first setup.

Tables: `profiles`, `trips`, `destinations`, `itinerary_days`, `activities`, `budget_items`

All tables have RLS enabled. Backend uses service role key (bypasses RLS).

---

## API Base

- Local: `http://localhost:3001`
- Health check: `GET /health`
- All protected routes: `Authorization: Bearer <supabase_access_token>`

---

## Key Decisions

- **Streaming**: SSE via `fetch` + `ReadableStream` (not `EventSource` — can't send auth headers)
- **Auth**: Supabase email/password, JWT forwarded to backend in Authorization header
- **Wizard state**: Zustand + localStorage — persists across refresh, cleared after trip creation
- **Shared trip view**: Backend uses service role key to fetch by share_token (no public RLS)
- **PDF**: jspdf on the backend — no headless browser needed

---

## Commit Convention

`[M{n}] {type}: {description}`

Types: feat, fix, refactor, chore, docs

---

## Current Status

**M1 — In progress**

---

## Task List

### M1 — Scaffold & Deploy
- [x] git init, create GitHub repo, push first commit
- [x] Create monorepo structure: frontend, backend, shared types
- [x] Set up frontend project with routing, auth, and UI library
- [x] Set up backend server with health check endpoint
- [x] Create deployment config for Vercel (frontend) and Railway (backend)
- [x] Set up database with all tables and access control from the start
- [x] Create CLAUDE.md in project root with full task list
- [ ] Set all environment variables in both deployment platforms
- [ ] Deploy both services to live URLs and confirm everything works end-to-end

### M2 — Onboarding Wizard
- [ ] Passport nationality — searchable dropdown with flags
- [ ] Travel style — multi-select chips (adventure, leisure, instagrammable, foodie, cultural)
- [ ] Trip details — date range, group size stepper, budget slider
- [ ] Summary screen — review all inputs before proceeding, with edit links
- [ ] Validation on every step — clear inline errors, no dead submissions
- [ ] State persists if user refreshes the page
- [ ] Mobile test at 375px before closing this milestone

### M3 — Destination Discovery
- [ ] AI call that takes user inputs and returns 6 ranked destination objects
- [ ] Skeleton loading state while AI is working — 6 placeholder cards
- [ ] Country card component: flag, name, visa badge, best months, vibe tags, cost range, select button
- [ ] Visa badge colour-coded: visa-free, visa-on-arrival, e-visa
- [ ] Visa disclaimer on every card
- [ ] On selection: save trip to database and navigate to itinerary screen
- [ ] Mobile test at 375px before closing this milestone

### M4 — Itinerary
- [ ] AI generates itinerary and streams it day by day to the frontend
- [ ] Days appear progressively with a visual indicator while streaming
- [ ] Day card: date header, three activity slots, restaurant rec, transport note
- [ ] Activity slot: title, description, duration, cost estimate
- [ ] Regenerate button per day — replaces just that day without affecting others
- [ ] Inline editing on activity title and description — auto-saves on change
- [ ] Sticky bottom bar with continue CTA
- [ ] Mobile test at 375px before closing this milestone

### M5 — Budget
- [ ] AI call that pre-fills budget estimates for all 7 categories
- [ ] Skeleton rows while AI is fetching
- [ ] Editable actual column — updates running total in real time
- [ ] Per-person split always visible at the top, auto-calculated
- [ ] Budget gauge: actual vs. stated budget, colour changes when over
- [ ] Auto-saves on every input change
- [ ] Mobile test at 375px before closing this milestone

### M6 — Save, Share & QA
- [ ] On trip completion: save to database, generate shareable link
- [ ] Shareable trip page — view-only, no login required
- [ ] Share button copies link to clipboard with a confirmation toast
- [ ] PDF export of the itinerary
- [ ] My Trips dashboard with all saved trips
- [ ] Empty state with a clear call to action
- [ ] Full flow QA on mobile (375px) and desktop — fix anything found
- [ ] Update CLAUDE.md status to complete
- [ ] Final commit and push

---

## Known Issues

_None yet_
