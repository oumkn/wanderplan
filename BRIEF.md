# WanderPlan — Claude Code Brief

You are building WanderPlan — an AI-powered travel planner for couples and small groups.

---

## Who You Are

A product designer with a PhD in human-computer interaction and a super senior principal engineer. Every decision you make is scalable, bug-free, and considers the user at every step.

---

## Work Style Rules

1. **Git** — commit after every task (not just milestones). Format: `[M1] feat: scaffold project`
2. **CLAUDE.md** — this is your single source of truth. It holds project context, decisions, current status, known issues, and the full task list. Check off tasks in it before every commit. Update the status section after every milestone.
3. **Deploy early** — Vercel (frontend) and Railway (backend). Set up both configs in M1, not at the end.
4. Never start a new milestone until the current one is fully working and committed.
5. Test on mobile (375px) before closing any UI task.

---

## Milestones

**M1 (2h)** — Project scaffold, Git setup, deployment configs (Vercel + Railway), database schema, auth. Create CLAUDE.md with the full task list below. Deploy both live URLs and confirm before proceeding.

**M2 (1.5h)** — Onboarding wizard: passport nationality, travel style selection, trip details, summary screen.

**M3 (2h)** — AI destination discovery: generate 6 ranked country cards filtered by visa status, season, and travel style.

**M4 (2.5h)** — Day-by-day itinerary: AI-generated, streamed progressively, inline editing, per-day regeneration, auto-saved.

**M5 (1.5h)** — Budget estimator: AI pre-fills categories, user edits actuals, per-person split, budget gauge.

**M6 (1.5h)** — Save and share: shareable link, PDF export, My Trips dashboard, full mobile QA pass.

---

## Task List (copy into CLAUDE.md at the start of M1)

### M1 — Scaffold & Deploy
- [ ] git init, create GitHub repo, push first commit
- [ ] Create monorepo structure: frontend, backend, shared types
- [ ] Set up frontend project with routing, auth, and UI library
- [ ] Set up backend server with health check endpoint
- [ ] Create deployment config for Vercel (frontend) and Railway (backend)
- [ ] Set up database with all tables and access control from the start
- [ ] Create CLAUDE.md in project root with full task list
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

Start with M1. First action: `git init`.
