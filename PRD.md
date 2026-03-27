# WanderPlan
**AI-Powered Travel Planner · PRD v3.1 · March 27, 2026**

Target users: Couples & small groups
Build time: One day (~10.5 hours)

---

## 1. Product Overview

WanderPlan guides couples and small groups from zero to a fully planned, budgeted, day-by-day trip in under 10 minutes. The user starts with their passport. The app ends with a shareable itinerary.

The core differentiator is intelligent destination discovery: passport nationality filters visa-eligible countries, seasonal weather and travel style rank the shortlist (adventure, leisure, instagrammable, foodie, cultural), and AI generates a complete itinerary with activities, meals, transport, and a pre-filled budget.

### Success Metrics

- Trip completion rate: >60% of users who reach step 2 complete a full itinerary
- Time to first itinerary: <10 minutes from landing
- Sharing rate: >25% of completed trips generate a shareable link
- Return rate: >30% of users start a second trip within 7 days

---

## 2. How We Work

These are non-negotiable working standards that apply throughout the build.

### Git
- Initialise a Git repo and push to GitHub as the very first action
- Commit after every completed task — not just after milestones
- Commit message format: `[M1] feat: scaffold project`
- main is always deployable. Never leave uncommitted changes when switching tasks.

### CLAUDE.md — Single Source of Truth
- Maintain CLAUDE.md in the project root from M1 onward
- It holds everything: project context, key decisions, current status, known issues, and the live task list
- The task list inside CLAUDE.md is checked off as tasks are completed, before every git commit
- Update the status and task list after every milestone
- Any future session picking up the project should be able to read CLAUDE.md and continue without questions

### Deployment
- Frontend deploys to Vercel. Backend/API server deploys to Railway.
- Set up both deployment configs in M1 — not at the end of the build
- Deploy to live URLs after M1 and confirm both are working before writing product features
- Every subsequent milestone should produce a deployable build

### Quality Bar
- You are a product designer with a PhD in human-computer interaction and a super senior principal engineer
- Every screen is designed as if you care deeply about the person using it
- Every system is built to scale and be bug-free from the start
- Test on mobile before closing any UI task — not just at the end

---

## 3. User Flow

Six steps, in order. A progress bar runs across the top of every step.

| Step | Screen | What the user does |
|------|--------|--------------------|
| 1 | Onboarding | Selects passport nationality, travel style (adventure / leisure / instagrammable / foodie / cultural), group size, budget, and travel dates. |
| 2 | Discovery | AI returns a ranked list of 6 destination countries, filtered by visa status, best travel season, and travel style match. |
| 3 | Country cards | Browses destination cards showing visa type, best months, vibe tags, and estimated cost. Selects one to continue. |
| 4 | Itinerary | AI generates a full day-by-day plan, streamed progressively. User can edit any activity inline or regenerate individual days. |
| 5 | Budget | AI pre-fills a budget by category. User edits actuals. Per-person split and a budget gauge update in real time. |
| 6 | Save & share | Trip is saved. User gets a shareable link (no account required to view). Can export a PDF of the itinerary. |

---

## 4. Feature Details

### Destination Discovery
- Filters destinations by visa accessibility for the user's passport (visa-free and visa-on-arrival prioritised)
- Ranks results by seasonal weather fit, travel style alignment, and budget compatibility
- Returns exactly 6 destinations as a ranked shortlist
- Each card shows: country name, flag, visa type, best travel months, vibe tags, estimated cost range
- A visa disclaimer appears on every card — always direct users to verify with the official embassy

### Itinerary Generator
- Generates a full day-by-day plan based on destination, duration, group size, and travel style
- Each day has morning, afternoon, and evening activity slots
- Each slot includes: activity name, short description, estimated duration, estimated cost
- Each day includes one restaurant recommendation and a transport note
- Days stream in progressively — user sees content appear as it is generated
- User can regenerate any individual day without affecting the rest
- User can edit any activity title or description inline — changes save automatically

### Budget Estimator
- AI pre-fills estimates across seven categories: flights, accommodation, food, activities, local transport, shopping, miscellaneous
- User can edit any figure — actuals update in real time
- Per-person split is always visible and auto-calculated
- A budget gauge shows total actual spend vs. the stated budget

### Save, Share & Export
- Completed trips are saved to the user's account
- Every trip gets a shareable link — recipients can view the itinerary without creating an account
- Users can export a clean PDF of their itinerary
- My Trips dashboard shows all saved trips with destination, dates, and group size

---

## 5. Milestones

Work through these in order. Each milestone must be fully working and committed before the next begins. Check off tasks in CLAUDE.md before every commit.

| # | Milestone | Time |
|---|-----------|------|
| M1 | Scaffold & deploy | 2 hrs |
| M2 | Onboarding wizard | 1.5 hrs |
| M3 | Destination discovery | 2 hrs |
| M4 | Itinerary | 2.5 hrs |
| M5 | Budget | 1.5 hrs |
| M6 | Save, share & QA | 1.5 hrs |

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

## 6. Out of Scope

- Real-time flight or hotel booking
- Collaborative editing by multiple users simultaneously
- Push notifications or email reminders
- Social features or public trip discovery
- Native mobile app
- Multi-language support
