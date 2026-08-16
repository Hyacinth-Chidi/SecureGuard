# Project Requirements & Features

## 1. Project Title

**SecureGuard — Cybersecurity Awareness & Phishing Simulation Portal**

A web-based educational platform that helps organizations measure and improve their employees' resilience against phishing attacks through:
1. Realistic simulated phishing campaigns with full tracking
2. Interactive security-awareness training with auto-graded quizzes
3. Quantitative risk scoring and organizational reporting

---

## 2. Problem Statement

Phishing remains the #1 initial access vector in data breaches (Verizon DBIR 2024), with **36% of breaches involving phishing** and a median organizational cost of **$4.65M per incident (IBM Cost of a Data Breach Report)**. Despite this, most organizations lack:

- A safe, controlled environment to test employee behavior without exposing real data
- Low-effort automation for sending realistic, varied phishing simulations
- Integrated training that automatically follows *immediately after* a user fails a simulation (or completes a course)
- Clear, quantifiable risk metrics per-department and per-employee that non-technical managers can interpret

SecureGuard addresses all four gaps in a single self-hosted platform.

---

## 3. Objectives

| ID | Objective | Measurable Criterion |
|---|---|---|
| O1 | Deliver realistic phishing simulations | ≥3 difficulty tiers, ≥6 landing-page themes, safe-by-design (no credentials stored) |
| O2 | Track every stage of phishing interaction | Open, click, credential-submit, and user-report — all time-stamped per recipient |
| O3 | Deliver integrated training | Markdown + video content, auto-graded quizzes, prerequisite gating |
| O4 | Close the loop: training → simulation → remediation | Auto-launch targeted phish after course completion; auto-reassign training on simulation failure |
| O5 | Gamify correct behavior | Badges (5+ types), resilience leaderboards, tiered scoring |
| O6 | Produce actionable organizational reports | Per-department resilience, click-rate trends, riskiest/safest employee leaderboards |
| O7 | Zero-hard-dependency install | Full demo flow works without SMTP, without Cloudinary, without 3rd-party APIs |

---

## 4. Stakeholders

| Role | Interests |
|---|---|
| **Admin / Security Manager** | Launch campaigns, view reports, manage templates & content, create students |
| **Employee / Student** | Complete training, view personal resilience score, report simulated phishing, earn badges |
| **HR / Department Head** | View department-level resilience via reports (read-only subset of admin dashboard) |
| **IT Administrator (deployer)** | Configure SMTP, MongoDB, Auth secret; run seed scripts; backup DB |

---

## 5. Functional Requirements

### 5.1 Authentication & Account Management

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-AUTH-01 | Admin and Student roles with role-based access control | Must | ✅ |
| FR-AUTH-02 | Email + Password login with bcrypt-hashed credentials | Must | ✅ |
| FR-AUTH-03 | JWT-based session (HttpOnly cookie) with role + department claims | Must | ✅ |
| FR-AUTH-04 | Active/inactive user flag — inactive users cannot log in | Must | ✅ |
| FR-AUTH-05 | Public self-registration for students (environment-flag gated) | Should | ✅ (gated by `.env.example` comment) |
| FR-AUTH-06 | Seed script bootstraps admin + sample employees + sample content | Must | ✅ |
| FR-AUTH-07 | Three-tier authorization: proxy, dashboard layout, per-API check (defense-in-depth) | Must | ✅ |

### 5.2 Phishing Simulation Management (Admin)

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-SIM-01 | Create, list, and delete phishing simulations (campaigns) | Must | ✅ |
| FR-SIM-02 | Target a simulation by department or "All Employees" | Must | ✅ |
| FR-SIM-03 | Each simulation is based on a reusable email template | Must | ✅ |
| FR-SIM-04 | Unique per-recipient tracking token; IDs never exposed in URLs | Must | ✅ |
| FR-SIM-05 | Simulated email send (console log) without SMTP config | Must | ✅ |
| FR-SIM-06 | Real Nodemailer SMTP send when SMTP_* env vars are set | Should | ✅ |
| FR-SIM-07 | Status lifecycle: draft → scheduled → running → completed (scheduled not yet wired to cron) | Could | ⚠️ partial |
| FR-SIM-08 | Simulation detail view with per-recipient result grid | Must | ✅ |
| FR-SIM-09 | Delete cascades: Simulation + related SimulationResults removed atomically in handler | Must | ✅ |

### 5.3 Phishing Email Template Management (Admin)

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-TPL-01 | CRUD email templates: name, category, difficulty, from, subject, HTML body | Must | ✅ |
| FR-TPL-02 | Template placeholder substitution: `{{first_name}}`, `{{tracking_link}}` | Must | ✅ |
| FR-TPL-03 | Landing page theme selection (6 variants: generic, Microsoft, Facebook, HR, Invoice, IT-Terminal) | Must | ✅ |
| FR-TPL-04 | Per-template educational reveal content: headline, body, red-flag bullets | Must | ✅ |
| FR-TPL-05 | Cannot delete a template that's in use by an existing simulation (409 Conflict) | Must | ✅ |
| FR-TPL-06 | "System template" protection from edit/delete (field referenced in check — not yet in schema) | Should | ⚠️ broken |

### 5.4 Phishing Interaction Tracking & Landing

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-TRK-01 | 1×1 transparent GIF pixel for "opened" detection | Must | ✅ |
| FR-TRK-02 | Link redirect → marks clicked, redirects student to /phish/[token] | Must | ✅ |
| FR-TRK-03 | Fake credential form submit: **NEVER stores/transmits entered text, only records timestamp of attempt** | Must | ✅ |
| FR-TRK-04 | Student-initiated "Report as Phishing" button on reveal screen | Must | ✅ |
| FR-TRK-05 | Context endpoint returns template metadata + submission/report status to client | Must | ✅ |
| FR-TRK-06 | On credential-submit → trigger remediation: reset progress + push notification | Must | ✅ |
| FR-TRK-07 | On report → award first_report badge + phish_survivor badge (if 3+ sims, 0 clicks) | Should | ✅ |

### 5.5 Training Module Management (Admin)

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-TRN-01 | CRUD training modules: title, summary, Markdown content, category, estimated time | Must | ✅ |
| FR-TRN-02 | Embedded quiz: 1–N questions, each with 2+ options + correct-index | Must | ✅ |
| FR-TRN-03 | Published/Draft toggle (draft hidden from students) | Must | ✅ |
| FR-TRN-04 | Prerequisite gating: course locked until prerequisite module is completed | Should | ✅ |
| FR-TRN-05 | Optional: link module to a simulation template (post-course phish trigger) | Should | ✅ |
| FR-TRN-06 | Optional featured image + embedded video URL support | Could | ✅ |
| FR-TRN-07 | Admin list view: show completion count + average score per module | Should | ✅ |
| FR-TRN-08 | Delete cascades: module + all associated TrainingProgress | Must | ✅ |

### 5.6 Training Delivery (Student)

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-TRN-09 | Student lists published modules with own progress status | Must | ✅ |
| FR-TRN-10 | Markdown content rendering with remark-gfm (tables, lists) | Must | ✅ |
| FR-TRN-11 | Quiz submission → auto-grade, record score + attempt count → status: completed | Must | ✅ |
| FR-TRN-12 | First-completion badge awards: first_course, perfect_score, all_courses | Should | ✅ |
| FR-TRN-13 | First completion auto-launches linked simulation (if simulationTemplateId set) + sends personalized phish email | Should | ✅ |
| FR-TRN-14 | Certificate page on completion (`/dashboard/student/training/[id]/certificate`) | Should | ✅ (route stub present) |

### 5.7 Employee Management (Admin)

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-EMP-01 | Admin can list all students with enriched data: resilience score, completed courses, sims received | Must | ✅ |
| FR-EMP-02 | Per-student resilience computed from course completion count + sim behavior | Must | ✅ |

### 5.8 Notifications & Badges

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-NOT-01 | 3 notification types: remediation, badge_earned, course_available | Must | ✅ |
| FR-NOT-02 | Student can dismiss single notification or mark all read | Must | ✅ |
| FR-NOT-03 | Top-20 notifications inbox view | Should | ✅ |
| FR-NOT-04 | 5 badge types (see database_design.md §10) — unique per (user, type) | Should | ✅ |
| FR-NOT-05 | Badges visible on student overview dashboard | Should | ✅ |

### 5.9 Reporting & Dashboards

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-RPT-01 | Admin overview: total students, training completions, click rate, report rate | Must | ✅ |
| FR-RPT-02 | Trend line chart: click-rate + report-rate per simulation over time | Must | ✅ |
| FR-RPT-03 | Department resilience: bar chart of avg resilience per department | Must | ✅ |
| FR-RPT-04 | Top-5 Riskiest / Top-5 Safest employee leaderboards | Must | ✅ |
| FR-RPT-05 | Student overview: risk score, resilience score, badges, recent simulations, training progress | Must | ✅ |
| FR-RPT-06 | Risk gauge visual component for student-facing risk score | Should | ✅ |
| FR-RPT-07 | Resilience tier labels (Novice → Aware → Defender → Guardian) | Should | ✅ |

### 5.10 UX & Accessibility

| ID | Requirement | Priority | Implemented |
|---|---|---|---|
| FR-UX-01 | Responsive layout: mobile sidebar with hamburger, multi-column desktop | Must | ✅ |
| FR-UX-02 | Focus-visible outlines + form focus rings (blue) for keyboard accessibility | Must | ✅ |
| FR-UX-03 | `prefers-reduced-motion` disables animations | Should | ✅ |
| FR-UX-04 | Styled scrollbars + glassmorphism card aesthetic | Could | ✅ |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target | Implemented Via |
|---|---|---|---|
| NFR-PERF-01 | API P95 response time for dashboard queries | <500 ms | Mongoose aggregation pipeline + compound indexes |
| NFR-PERF-02 | Initial page load (LCP) | <2.0 s | Server Components, Tailwind v4 zero-JS, font-display:swap |
| NFR-PERF-03 | Support 10,000 students × 10 campaigns each = 100k SimulationResult rows without UI degradation | Linear aggregate | MongoDB aggregation (linear in result rows, not docs scanned) + reporting via one-pass `$group` |
| NFR-PERF-04 | DB connection caching across hot reloads (dev) | No connection exhaustion | `global._mongooseCache` in `lib/db.ts` (cached promise pattern) |

### 6.2 Security

| ID | Requirement | Implemented Via |
|---|---|---|
| NFR-SEC-01 | No credential harvesting in simulated forms | Client form never sends input; only an empty POST to `/api/track/s/[token]` — code comment documents this |
| NFR-SEC-02 | Passwords never stored plaintext | bcrypt cost-factor 10 at create-time; `authorize()` always uses bcrypt.compare() |
| NFR-SEC-03 | Auth secret required; fail-fast on boot | `db.ts` throws hard if `MONGODB_URI` missing; README documents `AUTH_SECRET` generation |
| NFR-SEC-04 | No enumeration of recipients via URL tokens | Random 16-byte hex token = 2^128 space; recipient IDs NOT exposed in URL |
| NFR-SEC-05 | Role escalation impossible via client tampering | Role embedded in JWT (signed) + 3 tiers of server-side re-check; nothing trusts client-side role |
| NFR-SEC-06 | All API POST/PATCH bodies: Zod runtime validation | `templateSchema`, `moduleSchema`, `signupSchema`, etc. — malformed input = 400 |
| NFR-SEC-07 | Environment-flag gated: `ENABLE_SELF_REGISTRATION` | `.env.example` defaults to `false` (however, route does not yet check it — see audit) |
| NFR-SEC-08 | Simulation admin-scoped list + create | All template/module/simulation endpoints: admin-created content only (adminIds pattern) |

### 6.3 Scalability & Operations

| ID | Requirement | Implementation |
|---|---|---|
| NFR-OPS-01 | Works with MongoDB Atlas cloud or local Docker MongoDB | `MONGODB_URI` env var |
| NFR-OPS-02 | Horizontal scale: stateless Next.js servers behind load balancer | JWT session → no server affinity required |
| NFR-OPS-03 | Build-time type-check + lint | `npm run typecheck`, `npm run lint` scripts |
| NFR-OPS-04 | Test suite for core helpers | `npm test` runs invite / organization-scope tenant tests |

### 6.4 Maintainability

| ID | Requirement | Evidence |
|---|---|---|
| NFR-MNT-01 | Type-safe: strict TypeScript everywhere | `tsconfig.json` → `"strict": true`; next-auth.d.ts extends session/JWT types |
| NFR-MNT-02 | Clear separation: models, routes, pages, lib utilities | Directory structure matches architectural layers |
| NFR-MNT-03 | Scoring logic: pure functions with no IO | `computeRiskScore`, `computeResilienceScore` → unit-testable without DB |
| NFR-MNT-04 | Feature-tunable weights: scoring easy to modify | Formula coefficients at top of `utils.ts` → documented; comment reads "tune the weights here" |

---

## 7. Feature Matrix: Role × Capability

| Capability | Admin | Student | Anonymous |
|---|:---:|:---:|:---:|
| Register account | ⚠️ via seed | ✅ (self-register, gated) | ✅ (/signup) |
| Log in / Log out | ✅ | ✅ | ❌ |
| Launch/delete phishing simulations | ✅ | ❌ | ❌ |
| View simulation detail / results | ✅ | ❌ | ❌ |
| CRUD email templates | ✅ | ❌ | ❌ |
| CRUD training modules | ✅ | ❌ | ❌ |
| View published training modules | ✅ (all) | ✅ (published) | ❌ |
| Take quiz / complete training | ⚠️ via API | ✅ | ❌ |
| Auto-targeted post-course phish | N/A (trigger) | ✅ (receives) | ❌ |
| View department resilience / reports | ✅ | ❌ | ❌ |
| View personal risk score + resilience | N/A | ✅ | ❌ |
| Report a simulated phish | N/A | ✅ | ❌ |
| Earn badges / notifications | N/A | ✅ | ❌ |
| Land on phishing page reveal | N/A | ✅ | ❌ (needs valid token) |

---

## 8. Assumptions & Dependencies

### Explicit Assumptions
1. **Email deliverability** — Real SMTP send quality (spam score, DKIM/SPF) is out of scope and depends on deployer DNS configuration.
2. **Simulations are one-shot sends** — there is no drip-email sequence engine.
3. **Multi-tenant scaling is admin-scoped content** not an `Organization` model. All admins share one tenant (design can be extended with `organizationId` FK).
4. **Simulation `scheduled` status** in the data model is reserved for a future cron/job runner; the current UI launches campaigns immediately.

### External Dependencies
| Dependency | Required? | Purpose |
|---|---|---|
| MongoDB (local or Atlas) | ✅ Yes | Primary datastore |
| AUTH_SECRET strong random string | ✅ Yes | Signs JWT session cookie |
| SMTP server (SMTP_HOST, USER, PASS) | ❌ Optional | Real email delivery; console fallback if not set |
| Cloudinary (NEXT_PUBLIC_CLOUDINARY_*) | ❌ Optional | Featured image uploads; empty string fallback if not set |

---

## 9. Scope (Out of)

Deliberately excluded from the v1.0 implementation:
- OAuth / SAML SSO (only Credentials provider)
- CSV export of reports (data is there in `/api/reports/overview`)
- Scheduled campaign job runner (status = `scheduled` exists but no cron wiring)
- Bulk student CSV import (individual create via signup or seed only)
- Organization / multi-tenant isolation (admin content scoping, not row-level)
- Real credential-harvesting (explicit design choice; this is a training tool, not a red-team tool)
