# System Architecture

## 1. Architectural Style

SecureGuard is built as a **full-stack monolithic web application** using the **Next.js 16 App Router**, which follows a **layered architecture** pattern with clear separation of concerns. The platform leverages Next.js's hybrid rendering capabilities combining Server Components, Server Actions, and Route Handlers (API routes) within a single unified codebase.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                         │
│  (Next.js Pages — Server Components + Client Components)         │
│   /login, /signup, /dashboard/admin/*, /dashboard/student/*,     │
│   /phish/[token], /courses/*                                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Server Actions / fetch()
┌────────────────────────────────▼────────────────────────────────┐
│                         Application Layer                         │
│   Server Actions: loginAction(), signOutAction()                  │
│   Route Handlers: /api/* (RESTful route handlers)                │
│   Auth: Auth.js v5 (NextAuth) Credentials + JWT                   │
│   Proxy: proxy.ts (middleware-style route boundary)               │
└────────────────────────────────┬────────────────────────────────┘
                                 │ requireAdmin() / requireUser()
┌────────────────────────────────▼────────────────────────────────┐
│                          Business Logic Layer                     │
│   utils.ts     — Risk score, resilience score, token generation  │
│   mailer.ts    — Email dispatch with simulated fallback          │
│   email.ts     — Template placeholder rendering + tracking pixel │
│   seed.ts      — Database seeding                                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │ connectDB() + Mongoose models
┌────────────────────────────────▼────────────────────────────────┐
│                       Data Access / Persistence                   │
│   lib/db.ts       — Cached Mongoose connection                   │
│   lib/models/*.ts — 8 Mongoose schemas (User, Template,          │
│                      Simulation, SimulationResult, Training... ) │
└────────────────────────────────┬────────────────────────────────┘
                                 │ MongoDB driver
┌────────────────────────────────▼────────────────────────────────┐
│                         Database Layer                            │
│                        MongoDB (Document Store)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Deployment & Runtime Architecture

```
                  ┌──────────────────────┐
                  │   User's Browser      │
                  │  (React Client SPA)   │
                  └──────────┬───────────┘
                             │ HTTPS
                  ┌──────────▼───────────┐
                  │   Next.js Server      │
                  │  (Node.js Runtime)    │
                  │                       │
                  │ • App Router Routing  │
                  │ • Server Components   │
                  │ • Route Handlers      │
                  │ • Server Actions      │
                  │ • Auth.js Session Mgmt│
                  └──────────┬───────────┘
                             │ TCP
              ┌──────────────▼──────────────┐
              │     MongoDB Server          │
              │  (Local / Atlas Cloud)      │
              │                             │
              │  Collections:               │
              │   users, templates,         │
              │   simulations, simulation-  │
              │   results, trainingmodules, │
              │   trainingprogresses,       │
              │   notifications, badges     │
              └─────────────────────────────┘

  Optional Integration (Env-Gated):
  ┌──────────────────────┐
  │   SMTP Mail Server    │  ← Nodemailer when SMTP_HOST is set
  │  (Gmail / SendGrid /  │    Otherwise: "simulated send" console log
  │   Custom SMTP)        │
  └──────────────────────┘
```

---

## 3. Three-Tier Authorization Model

SecureGuard implements **defense-in-depth** with three independent authorization checks:

| Tier | Layer | Mechanism | File |
|------|-------|-----------|------|
| **Tier 1** | Proxy / Edge | URL pattern matching + role-based redirect | `src/proxy.ts` |
| **Tier 2** | Dashboard Layout | Server-side `auth()` call before rendering shell | `src/app/dashboard/layout.tsx` |
| **Tier 3** | API Route / Action | Per-endpoint `requireAdmin()` / `requireUser()` | `src/lib/apiAuth.ts` |

> **Rationale**: Next.js 16 explicitly recommends not trusting the proxy/middleware layer alone for authorization. The triple-check pattern prevents both accidental misconfiguration and potential middleware bypass attacks.

---

## 4. Authentication Flow (Auth.js v5 — JWT Sessions)

```
┌─────────┐     1. POST /login FormData      ┌──────────────┐
│ Browser │ ─────────────────────────────────▶│  Next Server │
│         │ ◀─────────────────────────────────│              │
└─────────┘     2. Set-Cookie: session JWT    └──────┬───────┘
                                                      │
                                         3. authorize() callback
                                                      │
                                           ┌──────────▼──────────┐
                                           │  connectDB()         │
                                           │  User.findOne(email) │
                                           │  bcrypt.compare()    │
                                           └──────────┬──────────┘
                                                      │
                                         4. JWT callbacks
                                                      │
                                           ┌──────────▼──────────┐
                                           │ jwt(): Encode role,  │
                                           │        dept, id into  │
                                           │        token.payload  │
                                           └──────────┬──────────┘
                                                      │
                                           ┌──────────▼──────────┐
                                           │ session(): Hydrate   │
                                           │   session.user with  │
                                           │   id, role, dept     │
                                           └─────────────────────┘
```

**Key security properties:**
- Passwords stored as bcrypt hashes (cost factor 10)
- JWT session token stored as HttpOnly, Secure cookie (production)
- User's `active: false` flag blocks login at `authorize()` step
- Role (`admin`/`student`) and `department` are embedded in JWT claims

---

## 5. Phishing Simulation End-to-End Flow

```
  Admin UI                                       Student Experience
 ┌─────────────┐                                 ┌─────────────────┐
 │ New Simulation│ 1. POST /api/simulations      │  Email Inbox    │
 │ Form (Name,  │ ──────────────────────────────▶│                 │
 │  Template,   │                                 │ ┌─────────────┐ │
 │  Department) │ 2. MongoDB writes:             │ │ IT Password │ │
 └──────┬───────┘    • Simulation document      │ │  Expiry!     │ │
        │              • N × SimulationResult   │ │ [Verify ⚠️]  │ │
        │                rows w/ unique tokens  │ └──────┬──────┘ │
        │                                       └────────┼────────┘
        │ 3. (Optional) Real SMTP send                    │ Click link
        │    via sendSimulationEmail()                    ▼
        │                                           /api/track/c/[token]
        │                                              │ │
        │                                              │ └─ openedAt = now()
        │                                              │    clickedAt = now()
        │                                              │
        │    Simulated Send (default)                  ▼
        │    Console log only                   /phish/[token] Landing Page
        │                                              │
        │                                     ┌────────┴────────┐
        │                                     │ Fake Login Form  │
        │                                     │ (6 UI themes)    │
        │                                     └────────┬────────┘
        │                                              │ Submit (never stores data!)
        │                                              ▼
        │                                     /api/track/s/[token]
        │                                              │
        │                                     submittedAt = now()
        │                                     Trigger: remediation
        │                                     • Reset TrainingProgress
        │                                     • Create Notification
        │                                              │
        │    ┌─────────────────────────────────────────┘
        │    ▼ Report button on reveal screen
 │ /api/track/r/[token]
        │    reportedAt = now()
        │    Award badges: first_report, phish_survivor
        │    Create Notification (positive reinforcement)
        ▼
 Reports Aggregates
 ┌──────────────────────────────────────────────────────────────┐
 │ /api/reports/overview                                         │
 │  • Click-rate trend line chart                                │
 │  • Department resilience bar chart                            │
 │  • Top-5 Riskiest / Safest leaderboards                      │
 │  • Org-wide click/report/submit rates                        │
 └──────────────────────────────────────────────────────────────┘
```

---

## 6. Post-Training Automated Phishing Loop

A distinctive feature of SecureGuard is the **closed-loop learning flow**:

```
  Student completes Training Quiz
           │
           ▼
  POST /api/training/[id]/progress
           │
           ├── Grade quiz → compute score
           ├── Award badges (first_course, perfect_score, all_courses)
           │
           └── If module has simulationTemplateId:
               │
               ├── Find/create Simulation: "Automated: {module.title}"
               ├── Create SimulationResult row w/ unique token
               ├── Render personalized phishing email template
               │   ({{first_name}}, {{tracking_link}} substituted)
               └── Send via Nodemailer (or simulated console send)
                        │
                        ▼
               ~1–3 days later, student gets the email
                        │
               Click, submit, or report → tracked & scored
                        │
                        ▼
               If submitted (failed):
                 • Reset training progress to in_progress
                 • Send remediation Notification
```

---

## 7. Risk & Resilience Scoring Architecture

### Risk Score Formula (0–100, higher = riskier)
```
score = (clickRate × 60) + (submitRate × 40) - (reportRate × 30)
clamped to [0, 100], rounded
```

### Resilience Score Formula (0–1000, higher = safer)
```
score = 100
      + completedCourses × 200
      + reported         × 100
      - clicked          × 150
      - submitted        × 250
clamped to [0, 1000], rounded
```

### Resilience Tier Mapping
| Min Score | Tier Label | Tone |
|-----------|-----------|------|
| 850 | Guardian | Success (Green) |
| 600 | Defender | Low (Blue) |
| 300 | Aware | Medium (Amber) |
| 0 | Novice | High (Red) |

These live in `src/lib/utils.ts` — pure functions with no side effects, easily unit-testable and tunable per-organization.

---

## 8. Rendering Strategy (Next.js App Router)

| Page Pattern | Rendering | Composition |
|---|---|---|
| `/login`, `/signup`, Landing | Static + Client Forms | Server page shell, client-side interactivity via `"use client"` |
| `/phish/[token]` | Client SPA | Single client component with stages: loading → form → revealed |
| Dashboard Layouts (`/dashboard/*`) | Server Component | `auth()` at top, renders `<Sidebar>` (client component) + children |
| Admin Pages (overview, reports...) | Client SPA | `useEffect → fetch('/api/*') → useState → Recharts visualizations` |
| Student Pages (overview, training...) | Client SPA | Same pattern, calls `/api/me/*` endpoints |
| API Routes (`/api/*`) | Server (Route Handlers) | Pure request/response — `connectDB()` + model operations |
| Server Actions | Server (RSC boundary) | `loginAction`, `signOutAction` form actions |

---

## 9. Technology Rationale

| Choice | Reasoning |
|---|---|
| **Next.js App Router** | Native support for Server Components + Route Handlers + file-based routing eliminates need for separate Express backend |
| **MongoDB + Mongoose** | Document model matches flexible phishing-template / quiz JSON shapes. Aggregation pipeline ideal for reporting (group, filter, compute). |
| **Auth.js v5 (beta)** | First-class App Router integration: `auth()` in Server Components, Server Actions for signIn/signOut, typed JWT + Session callbacks. |
| **Tailwind CSS v4** | Zero-JS-config `@theme` CSS variables → accessible theming, zero-runtime cost, design-system consistency. |
| **Zod validation** | Runtime type-guard on every API POST/PATCH body. Shrinks attack surface against malformed input. |
| **Nodemailer (optional)** | SMTP is opt-in. Platform fully functional *without* email provider via simulated-send console fallback. Reduces onboarding friction. |
