# SiftMail — Master Roadmap & Implementation TODO

---

## 🎯 Project Overview
**SiftMail**: AI-Powered Smart Email Sorter that intelligently organizes, categorizes, prioritizes, and summarizes emails using Machine Learning and NLP.

---

## 📅 Phase-by-Phase Roadmap

### 🟩 Phase 1: Architecture, Core Infrastructure & Documentation
- [x] Create project repository structure and resolve branch publishing with `origin/main`
- [x] Author comprehensive documentation suite (`PRD`, `TRD`, `DFD`, `HLD`, `LLD`, `UI_WIREFRAMES`, `USER_STORIES`, `DATABASE_DESIGN`, `API_DESIGN`, `MASTER_TODO`)
- [x] Configure backend package dependencies (`express`, `@google/genai`, `cors`, `dotenv`, `tsx`, `typescript`)
- [x] Configure frontend package dependencies (`react`, `vite`, `lucide-react`, `typescript`)
- [x] Establish root mono-scripts (`npm run dev:backend`, `npm run dev:frontend`, `npm run install:all`)

---

### 🟨 Phase 2: Backend Services, AI Engine & REST APIs
- [x] Build data store models & sample emails in `backend/src/data/sampleEmails.ts`
- [x] Implement dual-engine AI Service in `backend/src/services/ai.service.ts`:
  - [x] Gemini 2.5 Flash API structured JSON parsing
  - [x] Local heuristic fallback NLP engine for offline/resilient triage
  - [x] Multi-tone smart reply generator
- [x] Implement Auth middleware (`backend/src/middleware/auth.middleware.ts`) with demo bypass support
- [x] Implement Express server entrypoint (`backend/src/server.ts`)
- [ ] Implement REST Routes:
  - [ ] `backend/src/routes/email.routes.ts` (List, Filter, Sift `/sift`, Reply `/reply`, Star/Read mutations)
  - [ ] `backend/src/routes/task.routes.ts` (CRUD tasks, Status toggle, Email backlink sync)
  - [ ] `backend/src/routes/analytics.routes.ts` (Health score, urgency distribution, velocity metrics)
  - [ ] `backend/src/routes/auth.routes.ts` (Login, Register, Demo session)

---

### 🟦 Phase 3: Frontend Web Application & Glassmorphic UI
- [ ] Implement design tokens & glassmorphic theme styling (`frontend/src/index.css`)
- [ ] Build global navigation & layout (`Sidebar`, `Topbar`, `Folder Badges`)
- [ ] Build **Inbox View**:
  - [ ] Email search bar & multi-criteria filters (Urgent, Work, Starred, All)
  - [ ] Email card list with dynamic urgency badges & score progress
  - [ ] Split-view email reader with rendered HTML/Plaintext & header details
- [ ] Build **AI Sifter Inspector Panel**:
  - [ ] Urgency radar & sentiment badge
  - [ ] Executive TL;DR summary card
  - [ ] Bulleted key takeaways with entity highlighting
  - [ ] Auto-extracted action items preview with "Add to Kanban" action
- [ ] Build **Action Items & Kanban Board**:
  - [ ] 3-Column drag/click workflow: `Pending` | `In Progress` | `Completed`
  - [ ] Priority tags (`Urgent`, `High`, `Medium`, `Low`) and deadline displays
  - [ ] Source email backlink navigation
- [ ] Build **Smart Reply Assistant Modal**:
  - [ ] Tone switcher (`Professional`, `Friendly`, `Concise`, `Formal`)
  - [ ] Custom guidance prompt input
  - [ ] 1-Click copy-to-clipboard and send actions
- [ ] Build **Analytics Dashboard**:
  - [ ] Inbox Health Score ring
  - [ ] KPI cards (Emails Processed, AI Time Saved, Pending Actions)
  - [ ] Visual Urgency breakdown bar and 7-day velocity chart

---

### 🟪 Phase 4: Testing, Verification & Polish
- [ ] Verify backend TypeScript compilation (`npx tsc --noEmit`)
- [ ] Verify frontend Vite production bundle build (`npm run build`)
- [ ] Test end-to-end flow: Ingest email ➔ Trigger AI Sift ➔ Auto-extract tasks ➔ Move task on Kanban ➔ Generate reply ➔ Verify Analytics
- [ ] Document quick-start instructions and test scripts

---

### 🟥 Phase 5: Production Enhancements & Integrations (Future Scope)
- [ ] Google Workspace / Gmail OAuth2 synchronization worker
- [ ] Microsoft Outlook / Graph API webhook ingestion
- [ ] Persistent PostgreSQL + Prisma ORM database migration
- [ ] Push notifications / desktop alerts for critical urgency emails
- [ ] Chrome Extension for Gmail inbox overlay

---

## 🏆 Definition of Done (DoD)
1. **Type Safety**: Zero TypeScript errors across both `backend` and `frontend`.
2. **Offline Resilience**: App functions seamlessly out-of-the-box even without a `GEMINI_API_KEY` via heuristic NLP.
3. **Responsive Aesthetics**: Modern dark glassmorphic UI with micro-interactions, high contrast WCAG 2.1 AA compliance.
4. **Documentation**: 100% of architecture, API contracts, and schema documented in `doc/`.
