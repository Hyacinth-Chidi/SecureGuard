# Project Structure

## 1. Repository Layout (Full Directory Tree)

```
secureguard/
├── .env                          # Environment variables (gitignored, not in repo)
├── .env.example                  # Template: MONGODB_URI, AUTH_SECRET, SMTP, seeds, Cloudinary
├── .gitignore
├── .npmrc
├── README.md                     # Quick-start: stack, setup, commands
├── eslint.config.mjs             # Next.js + ESLint flat config
├── next.config.ts                # Next.js 16 config (typedRoutes disabled)
├── package.json                  # Scripts, 35 deps (see §2)
├── package-lock.json
├── postcss.config.cjs            # Tailwind CSS v4 PostCSS
├── tsconfig.json                 # TS strict mode, path alias @/* → src/*
├── tsconfig.tsbuildinfo
│
├── docs/                         # ── NEW: Final-year project documentation ──
│   ├── architecture.md           # System architecture, diagrams, flows
│   ├── database_design.md        # ERD, 8 schemas, indexes, integrity
│   ├── Project_requirements_and_features.md  # FR/NFR, feature matrix
│   ├── Project_Structure.md      # This file
│   └── Project_audit.md          # Code review + risks + fixes
│
├── public/
│   └── assets/
│       └── logo.png              # SecureGuard 28×28 logo
│
└── src/
    ├── auth.ts                   # Auth.js v5: Credentials provider, JWT/session callbacks
    ├── proxy.ts                  # Next.js 16 proxy (successor to middleware.ts):
    │                             #   Auth redirects, role-based route boundary for /dashboard
    ├── next-env.d.ts             # Next-generated
    │
    ├── types/
    │   └── next-auth.d.ts        # Type extensions: Session.user.id, .role, .department; JWT claims
    │
    ├── lib/
    │   ├── db.ts                 # Cached Mongoose connectDB() (global._mongooseCache pattern)
    │   ├── apiAuth.ts            # requireAdmin() / requireUser() helpers for API routes
    │   ├── utils.ts              # Pure functions:
    │   │                         #   generateTrackingToken(), cn(), formatDate/DateTime(),
    │   │                         #   initials(), computeRiskScore(), computeResilienceScore(),
    │   │                         #   riskLabel(), resilienceLabel()
    │   ├── mailer.ts             # sendSimulationEmail(): Nodemailer + console fallback
    │   ├── email.ts              # renderSimulationEmail(): placeholder subst + tracking pixel
    │   ├── seed.ts               # npm run seed: admin + 6 students + 4 templates + 3 courses
    │   ├── seed-library.ts       # npm run seed:library (additional content)
    │   │
    │   ├── __tests__/            # Node --test suite:
    │   │   ├── invites.test.ts
    │   │   ├── organizationScope.test.ts
    │   │   └── tenant.test.ts
    │   │
    │   └── models/               # 8 Mongoose schemas (see database_design.md):
    │       ├── User.ts
    │       ├── Template.ts
    │       ├── Simulation.ts
    │       ├── SimulationResult.ts
    │       ├── TrainingModule.ts
    │       ├── TrainingProgress.ts
    │       ├── Notification.ts
    │       └── Badge.ts
    │
    ├── components/
    │   ├── dashboard/            # Layout shell + form components:
    │   │   ├── Sidebar.tsx           # Client: admin/student links, mobile hamburger, sign-out
    │   │   ├── PageHeader.tsx        # Page title + description + action slot
    │   │   ├── States.tsx            # LoadingBlock, EmptyState, etc.
    │   │   ├── TemplateForm.tsx      # Admin: create/edit email template
    │   │   └── TrainingForm.tsx      # Admin: create/edit training module
    │   │
    │   └── ui/                     # Atomic UI primitives:
    │       ├── Button.tsx
    │       ├── Primitives.tsx        # Card (glass-panel), Badge (tone-based), StatCard
    │       └── RiskGauge.tsx         # Student dashboard SVG gauge
    │
    └── app/
        ├── globals.css           # Tailwind @theme tokens + custom CSS
        ├── layout.tsx            # Root layout: Space Grotesk / Inter / JetBrains Mono fonts
        ├── page.tsx              # Landing page (Marketing / Hero / CTA to Login & Signup)
        ├── actions.ts            # Server: signOutAction() — shared form action
        │
        ├── login/
        │   ├── page.tsx              # Login route
        │   ├── LoginForm.tsx         # Client: email + password form
        │   └── actions.ts            # Server: loginAction() (wraps signIn, handles AuthError)
        │
        ├── signup/
        │   ├── page.tsx              # Signup route (student self-register)
        │   └── SignupForm.tsx        # Client: name + email + password form
        │
        ├── phish/
        │   └── [token]/
        │       └── page.tsx          # Phishing landing (6 fake-login themes + reveal/educational stage)
        │
        ├── courses/
        │   ├── page.tsx              # Public course listing (SEO)
        │   └── [id]/
        │       ├── page.tsx          # Course detail: Markdown lesson + quiz
        │       └── CourseQuiz.tsx    # Client quiz UI, calls POST /api/training/[id]/progress
        │
        ├── dashboard/
        │   ├── layout.tsx            # Server: auth() re-check → Sidebar shell + children
        │   ├── page.tsx              # Route dispatcher: redirects /dashboard → role-appropriate home
        │   │
        │   ├── admin/
        │   │   ├── page.tsx              # /dashboard/admin — Admin overview: stats, trend, leaderboards
        │   │   ├── reports/
        │   │   │   └── page.tsx          # Reports dashboard
        │   │   ├── simulations/
        │   │   │   ├── page.tsx          # List all simulations + delete
        │   │   │   ├── new/
        │   │   │   │   └── page.tsx      # Create-simulation wizard (form)
        │   │   │   └── [id]/
        │   │   │       └── page.tsx      # Simulation detail: per-recipient result grid
        │   │   ├── templates/
        │   │   │   ├── page.tsx          # List templates
        │   │   │   ├── new/
        │   │   │   │   └── page.tsx      # New-template form (TemplateForm wrapper)
        │   │   │   └── [id]/
        │   │   │       └── page.tsx      # Edit-template form
        │   │   ├── training/
        │   │   │   ├── page.tsx          # List modules (with completions / avg score)
        │   │   │   ├── new/
        │   │   │   │   └── page.tsx      # New-module form (TrainingForm wrapper)
        │   │   │   └── [id]/
        │   │   │       └── page.tsx      # Edit-module form
        │   │   └── students/
        │   │       └── page.tsx          # Students table: resilience, courses, sim count
        │   │
        │   └── student/
        │       ├── page.tsx              # /dashboard/student — Personal overview: score + activity + notifications
        │       ├── profile/
        │       │   └── page.tsx          # Profile / settings
        │       └── training/
        │           ├── page.tsx          # List enrolled courses with progress
        │           └── [id]/
        │               ├── page.tsx          # Take training
        │               └── certificate/
        │                   └── page.tsx      # Completion certificate view
        │
        └── api/                         # Route Handlers (RESTful, JSON)
            ├── auth/
            │   └── [...nextauth]/
            │       └── route.ts              # Auth.js route handler (all methods)
            │
            ├── signup/
            │   └── route.ts                  # POST — public student self-register
            │
            ├── me/
            │   ├── overview/
            │   │   └── route.ts              # GET — student personal dashboard data
            │   ├── notifications/
            │   │   └── route.ts              # GET list, PATCH mark-read (one or all)
            │   └── profile/
            │       └── route.ts              # Profile read/update
            │
            ├── reports/
            │   └── overview/
            │       └── route.ts              # GET admin org-wide aggregates (trend + department + leaders)
            │
            ├── admin/
            │   └── students/
            │       └── route.ts              # GET admin student list (enriched: resilience, completions)
            │
            ├── simulations/
            │   ├── route.ts                  # GET list (aggregated stats), POST create
            │   └── [id]/
            │       └── route.ts              # GET detail + results, DELETE simulation + cascade results
            │
            ├── templates/
            │   ├── route.ts                  # GET list, POST create
            │   └── [id]/
            │       └── route.ts              # GET detail, PATCH update, DELETE (409 if in-use)
            │
            ├── training/
            │   ├── route.ts                  # GET list (admin enriched / student own progress), POST create
            │   └── [id]/
            │       ├── route.ts              # GET detail (prereq check), PATCH update, DELETE cascade
            │       └── progress/
            │           └── route.ts          # POST quiz submission → grade, badges, auto-phish launch
            │
            └── track/                       # Public token-based tracking (no auth needed):
                ├── o/
                │   └── [token]/
                │       └── route.ts          # GET 1×1 GIF → openedAt = now()
                ├── c/
                │   └── [token]/
                │       └── route.ts          # GET → clickedAt = now() + 302 → /phish/[token]
                ├── s/
                │   └── [token]/
                │       └── route.ts          # POST → submittedAt = now() + remediation trigger
                ├── r/
                │   └── [token]/
                │       └── route.ts          # POST → reportedAt = now() + badge awards
                └── context/
                    └── [token]/
                        └── route.ts          # GET → template metadata for /phish rendering
```

---

## 2. package.json Scripts & Dependencies Reference

### 2.1 Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Start dev server (Turbopack default in Next 16) |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Serve production build |
| `npm run lint` | `eslint` | Lint all `.ts`/`.tsx` files (ESLint 10, flat config) |
| `npm run typecheck` | `tsc --noEmit` | Strict TypeScript check |
| `npm test` | `node --import tsx --test src/lib/__tests__/*.test.ts` | Node built-in test runner for tenant/scope helpers |
| `npm run seed` | `tsx src/lib/seed.ts` | Create admin + 6 sample students + 4 templates + 3 courses |
| `npm run seed:library` | `tsx src/lib/seed-library.ts` | Optional content library seed |
| `npm run backfill:orgs` | `tsx scripts/backfill-organization-ids.ts` | Assign legacy records to default org (future multi-tenant) |

### 2.2 Runtime Dependencies

| Package | Version | Usage |
|---|---|---|
| `next` | ^16.2.12 | Framework: App Router, Server Components, Route Handlers |
| `react` / `react-dom` | 19.2.7 | UI runtime (React 19 with Server Components) |
| `next-auth` | ^5.0.0-beta.32 | Auth.js v5: Credentials provider + JWT sessions |
| `mongoose` | 9.7.4 | MongoDB ODM + aggregations |
| `mongodb` | 7.5.0 | Peer driver |
| `bcryptjs` | 3.0.3 | Password hashing at cost-factor 10 |
| `nodemailer` | ^9.0.3 | SMTP send (optional; console fallback) |
| `zod` | 4.4.3 | Runtime input validation on all API POST/PATCH |
| `date-fns` | 4.4.0 | Date helpers |
| `recharts` | 3.9.2 | Line + Bar charts on dashboards (line trend, dept resilience) |
| `lucide-react` | 1.25.0 | Icon set (ShieldAlert, Fish, GraduationCap, etc.) |
| `react-markdown` | ^10.1.0 | Render `TrainingModule.content` Markdown |
| `remark-gfm` | ^4.0.1 | GitHub Flavored Markdown (tables, strikethrough) |
| `@uiw/react-md-editor` | ^4.1.1 | Admin MDE when creating training (Markdown editor) |
| `@tailwindcss/typography` | ^0.5.20 | `.prose` styles for rendered Markdown |
| `next-cloudinary` | ^6.17.5 | Featured image upload (optional) |
| `react-is` | ^19.2.8 | Peer dep for MDE / Recharts |

### 2.3 Dev Dependencies

| Package | Version | Usage |
|---|---|---|
| `typescript` | 5.9.3 | Strict mode |
| `@types/node`, `@types/react`, `@types/react-dom` | latest | TS definitions |
| `@types/nodemailer` | 7.0.4 | TS definitions |
| `tsx` | 4.23.1 | TS-node alternative: runs seed scripts + tests |
| `dotenv` | 17.4.2 | Loads `.env` in seed scripts (outside Next runtime) |
| `postcss` | ^8.5.25 | Tailwind CSS v4 pipeline |
| `@tailwindcss/postcss` | 4.3.3 | Tailwind v4 PostCSS plugin |
| `tailwindcss` | 4.3.3 | Tailwind v4 CSS-first (`@theme`) |
| `eslint` / `eslint-config-next` | ^10.8.0 / ^0.2.4 | Next ESLint flat config |
| `@eslint/eslintrc` | ^0.1.0 | Flat-config compatibility helper |

---

## 3. Module Responsibility Map

### 3.1 Application Entry Layer

| Path | Type | Responsibility |
|---|---|---|
| `src/proxy.ts` | Proxy / Route boundary | First auth/role gate. Redirects unauth → `/login`, wrong-role → opposite dashboard. Covers `/login`, `/signup`, `/dashboard/:path*`. |
| `src/app/layout.tsx` | Root Server Layout | Loads fonts (Space Grotesk, Inter, JetBrains Mono), sets `<html>` vars, page metadata. |
| `src/auth.ts` | Auth config | Credentials provider, `authorize()` finds User + bcrypt.verify, JWT callback encodes role/dept/id, Session callback hydrates session.user. |
| `src/app/actions.ts` | Shared Server Action | `signOutAction()` wraps `auth.signOut()` → redirects `/login`. |

### 3.2 Domain / Business Logic Layer (`src/lib/`)

| File | Responsibilities |
|---|---|
| `lib/db.ts` | Mongoose connection cache (`global._mongooseCache` pattern). Hot-reload safe. `connectDB()` is idempotent. |
| `lib/apiAuth.ts` | Two helpers used in **every** API route: `requireAdmin()` → 401 if not admin; `requireUser()` → 401 if not logged in. |
| `lib/utils.ts` | All pure, zero-IO utilities:<br>• `generateTrackingToken()` (16 random hex bytes)<br>• `cn()` (classnames)<br>• `formatDate()`, `formatDateTime()`<br>• `initials()` (avatar monogram)<br>• `computeRiskScore()`: 0–100, higher = riskier<br>• `computeResilienceScore()`: 0–1000, higher = safer<br>• `riskLabel()`, `resilienceLabel()`: tier classification + tone |
| `lib/mailer.ts` | `sendSimulationEmail({to, fromName, fromEmail, subject, html})`<br>• If SMTP_HOST not set: `console.log("[SecureGuard][simulated-send] ...")`<br>• If SMTP set: Nodemailer transporter → real send. Returns `{simulated: boolean}`. |
| `lib/email.ts` | `renderSimulationEmail()` — Replaces `{{first_name}}` / `{{tracking_link}}`, auto-appends `trackingPixelUrl` as 1×1 hidden GIF. |
| `lib/seed.ts` | Standalone `tsx` entry:<br>1. `bcrypt.hash()` admin password, upsert admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env)<br>2. 6 sample students across 5 departments, all with password `Student123!`<br>3. 4 templates of varying difficulty (IT-expiry, Package-delivery, CEO-Wire, HR-benefits)<br>4. 3 training modules with quizzes; first one auto-linked for post-course simulation |
| `lib/models/*.ts` (8 files) | Mongoose schema + TypeScript `I*` interface. Each uses `models.X ?? model<I*>("X", XSchema)` pattern → HMR-safe no-redefine. |

### 3.3 Presentation Layer (`src/components/` + `src/app/**/page.tsx`)

#### Layout & Primitives
| Path | Role |
|---|---|
| `components/dashboard/Sidebar.tsx` | Client side-component. Role-aware link list (`adminLinks` vs `studentLinks`). Mobile: hamburger + overlay. Avatar monogram + sign-out `<form action={signOutAction}>`. |
| `components/dashboard/PageHeader.tsx` | Title + subtitle + optional `action` (e.g., "New Simulation" button) |
| `components/dashboard/States.tsx` | `LoadingBlock` (skeleton) / `EmptyState` (empty list placeholder) |
| `components/dashboard/TemplateForm.tsx` | Admin form: name, category, difficulty, from, subject, HTML body, landing type, headline, body, redFlags. Calls POST/PATCH `/api/templates/[id]`. |
| `components/dashboard/TrainingForm.tsx` | Admin form: title, summary, category, est. minutes, MDE content editor, quiz Q/A builder, video/image URLs. Calls POST/PATCH `/api/training/[id]`. |
| `components/ui/Primitives.tsx` | • `Card` → `glass-panel` (backdrop-blur + rgba bg + border)<br>• `Badge` → 6 tones: low/medium/high/neutral/info/success<br>• `StatCard` → number + label + optional icon + hover-lift |
| `components/ui/RiskGauge.tsx` | SVG arc gauge for student risk score (0–100). Color gradient low→high. |
| `components/ui/Button.tsx` | Variant system: primary / ghost / danger / outline. Consistent padding, rounded-xl. |

#### Admin Pages (`src/app/dashboard/admin/`)
| Route | Data source | Charts / UI elements |
|---|---|---|
| **Overview** (`page.tsx`) | `GET /api/reports/overview` | 4 StatCards, LineChart (click vs report trend), "Requires attention" top-5 riskiest list, BarChart (department resilience). |
| **Reports** (`reports/page.tsx`) | Same overview data | Dedicated reports view. |
| **Simulations List** (`simulations/page.tsx`) | `GET /api/simulations` | Card per simulation: status badge, template name, target dept, targets/clicked/reported/date, View Results → detail, Delete → confirm. |
| **Simulations New** (`simulations/new/page.tsx`) | Form → `POST /api/simulations` | Department dropdown, template selector, name field. |
| **Simulation Detail** (`simulations/[id]/page.tsx`) | `GET /api/simulations/[id]` | Per-recipient grid: name/email/dept, timestamps (sent/opened/clicked/submitted/reported). |
| **Templates List** (`templates/page.tsx`) | `GET /api/templates` | Cards per template, difficulty badge, edit/delete. Delete blocked 409 if in use. |
| **Templates New/Edit** | `TemplateForm.tsx` | Full template editor. |
| **Training List** (`training/page.tsx`) | `GET /api/training` | Completion count + avg score per module. |
| **Training New/Edit** | `TrainingForm.tsx` | Markdown editor + quiz builder. |
| **Students** (`students/page.tsx`) | `GET /api/admin/students` | Enriched table: resilience score, completions, sims, joined date. |

#### Student Pages (`src/app/dashboard/student/`)
| Route | Data source | Key UI |
|---|---|---|
| **Overview** (`page.tsx`) | `GET /api/me/overview` + `GET /api/me/notifications` | Notification banners (remediation = red, badge = teal), Resilience card with tier badge, Activity 4-tile grid, Recent sim emails list with "Report as phishing" button per row. |
| **Training List** (`training/page.tsx`) | `GET /api/training` | Card per module with progress badge (not_started / in_progress / completed) + score. |
| **Training Detail** (`training/[id]/page.tsx`) | `GET /api/training/[id]` + `CourseQuiz.tsx` | Markdown content, quiz with per-question radio + submit, score reveal. |
| **Certificate** (`training/[id]/certificate/page.tsx`) | TrainingProgress | Printable styled certificate (route exists). |
| **Profile** (`profile/page.tsx`) | `GET /api/me/profile` | Personal info editor. |

#### Public Pages
| Route | Data source | Key UI |
|---|---|---|
| `/phish/[token]/page.tsx` | `GET /api/track/context/[token]` (client fetch) | Two stages: (1) **Form** = themed fake login (generic / Microsoft / Facebook / HR / Invoice / IT-Terminal) submits to `/api/track/s/[token]` (never transmits entered values). (2) **Revealed** = red-flag educational debrief, Report-as-phishing button, link to re-take training. |
| `/courses/*` | Same as student training list | SEO-visible course browser. |

---

## 4. Route Handler Inventory (REST API)

### 4.1 Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| ALL | `/api/auth/[...nextauth]` | Auth.js | csrf, signin, signout, callback, session, providers |

### 4.2 Public Tracking (token-based, no auth)
| Method | Path | Body | Side Effects |
|---|---|---|---|
| GET | `/api/track/o/[token]` | — | Set openedAt. Returns 1×1 transparent GIF `image/gif`. |
| GET | `/api/track/c/[token]` | — | Set openedAt + clickedAt. **302 Redirect** → `/phish/[token]`. |
| POST | `/api/track/s/[token]` | Ignored! Empty body accepted. | Set submittedAt. Trigger remediation: reset linked TrainingProgress + Notification. |
| POST | `/api/track/r/[token]` | Ignored. | Set reportedAt. Award first_report + phish_survivor badges. Create badge_earned Notification. |
| GET | `/api/track/context/[token]` | — | Returns template metadata + submission/report status for /phish rendering. |

### 4.3 Admin (requireAdmin)
| Method | Path | Zod Schema | Description |
|---|---|---|---|
| GET | `/api/simulations` | — | Aggregated list per sim: total/clicked/reported counts (via `$lookup` + `$size` + `$filter`). |
| POST | `/api/simulations` | Partial (name, templateId, targetDepartment) | Create Simulation + N SimulationResult rows w/ unique tokens; set status running + sentAt now. |
| GET | `/api/simulations/[id]` | — | Populate templateName + per-recipient result list. |
| DELETE | `/api/simulations/[id]` | — | Cascade: Simulation + SimulationResult rows for that sim. |
| GET | `/api/templates` | — | List all templates created by admins. |
| POST | `/api/templates` | `templateSchema` (name, category, difficulty, from, subject, htmlBody, landingHeadline, landingBody, redFlags[]) | Validate + create. |
| GET/PATCH/DELETE | `/api/templates/[id]` | `partial(templateSchema)` for PATCH | Admin-scoped. PATCH/DELETE checks `isSystem` (currently undefined field → passes always). DELETE pre-checks Simulation.exists → 409 if in use. |
| GET | `/api/training` | — | Admin: modules + completions + avgScore per module + totalStudents enrichment. |
| POST | `/api/training` | `moduleSchema` + `quizQuestionSchema` | Create training module. |
| GET/PATCH/DELETE | `/api/training/[id]` | Partial for PATCH | Admin: full detail + update/delete (cascade TrainingProgress on delete). |
| GET | `/api/admin/students` | — | Enriched list: resilienceScore, completedCourses count, totalSimulations. |
| GET | `/api/reports/overview` | — | All aggregates: totals, click/report/submit rates, per-sim trend, department resilience, riskiest+safest leaderboards, trainingCompletion count. |

### 4.4 Authenticated User (requireUser — admin or student)
| Method | Path | Zod Schema | Student behavior |
|---|---|---|---|
| GET | `/api/training` | — | List published modules + own progress row per module (quiz stripped to prevent cheating). |
| GET | `/api/training/[id]` | — | Published-only check. Prerequisite completion check → `{locked:true, prerequisite:{...}}` if locked. Auto-create TrainingProgress in_progress on first view. |
| POST | `/api/training/[id]/progress` | `{answers: number[]}` — submitSchema | Grade vs `quiz[].correctIndex`, round-score %, upsert status=completed/score/attempts. First completion → post-course auto-phish if linked. Award: first_course, perfect_score, all_courses badges. |
| GET | `/api/me/overview` | — | Personal riskScore, resilienceScore, sim stats, recent 10 emails, training progress total/completed, badges. |
| GET | `/api/me/notifications` | — | Top-20 notifications by createdAt + unread count. |
| PATCH | `/api/me/notifications` | `{id?: string, all?: boolean}` | Mark one by id **or** all as read. |

### 4.5 Fully Public
| Method | Path | Zod Schema | Notes |
|---|---|---|---|
| POST | `/api/signup` | `{name, email, password}` — signupSchema | Creates role=student, department="Student". bcrypt 10. 409 on duplicate email. **No ENABLE_SELF_REGISTRATION flag check yet.** |

---

## 5. Cross-Cutting Concerns

| Concern | Implementation Pattern | Where defined |
|---|---|---|
| **Auth checks** | Every API route → `const {error, session} = await requireAdmin/User(); if (error) return error` | `lib/apiAuth.ts` |
| **DB connection** | Every handler → `await connectDB()` at top (idempotent, cached) | `lib/db.ts` |
| **Input validation** | POST/PATCH → `z.safeParse(body); if (!parsed.success) return 400` | Per-route Zod schemas inline |
| **Error handling** | All DB operations wrapped in `try/catch`; `return 500` generic to avoid stack leaks | Per-route |
| **Admin content scoping** | `const adminIds = await User.find({role:"admin"},"_id")` → every find() filters by `createdBy: {$in: adminIds}` | All template/training/simulation list/detail routes |
| **Timestamp tracking** | `{timestamps: true}` on **all** Mongoose schemas → `createdAt/updatedAt` everywhere | Per-schema |
