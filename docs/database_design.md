# Database Design

## 1. Database Choice Rationale

SecureGuard uses **MongoDB 7.x** with **Mongoose 9.x** ODM. MongoDB was selected because:

1. **Flexible schemas** — Phishing email templates and quiz questions have highly variable structures (HTML bodies with placeholders, arbitrary arrays of red flags, variable-length option lists).
2. **Rich Aggregation Pipeline** — Reporting queries (per-user risk scores, department averages, campaign funnels, leaderboards) are expressed as single aggregation passes instead of complex multi-SQL joins.
3. **Document locality** — A TrainingModule document embeds its Quiz subdocuments inline, so loading a course requires exactly one query.
4. **Horizontal scaling** — As the number of students and simulation campaigns grows, MongoDB Atlas sharding can scale horizontally without schema redesign.

---

## 2. Entity-Relationship Diagram (ERD) — Conceptual

```
┌──────────────┐         ┌──────────────────┐
│    User      │         │     Badge        │
│──────────────│         │──────────────────│
│ PK  _id      │◄──1:N───│ FK  userId       │
│     name     │         │ PK  badgeType    │
│     email    │         │     earnedAt     │
│ UK  email    │         └──────────────────┘
│     role*    │
│     passwordHash      ┌──────────────────┐
│     department│◄──1:N─│  Notification    │
│     jobTitle │        │──────────────────│
│     active   │        │ FK  userId       │
└──────┬───────┘        │     type*        │
       │                │     title,message│
       │                │     read         │
       │                │ INDEX (user,read,│
       │                │        createdAt)│
       │                └──────────────────┘
       │
       │  1:N  createdBy
       │
       ▼
┌──────────────────┐       ┌──────────────────────────┐
│    Template      │       │     Simulation           │
│──────────────────│       │──────────────────────────│
│ PK  _id          │◄──FK──│ PK  _id                  │
│ FK  createdBy ───┼──1:N─▶│ FK  templateId           │
│     name         │       │ FK  createdBy (User)     │
│     category     │       │     name                 │
│     difficulty*  │       │     status*              │
│     fromName/Email│      │     targetDepartments[]  │
│     subject      │       │     targetUserIds[] (ref)│
│     htmlBody     │       │     scheduledAt/sentAt   │
│     landingType* │       │     completedAt          │
│     landingHeadline│     └──────────┬───────────────┘
│     landingBody  │                  │
│     redFlags[]   │                  │  1:N
└──────────────────┘                  ▼
                            ┌──────────────────────────┐
                            │   SimulationResult       │
                            │──────────────────────────│
                            │ PK  _id                  │
                            │ UK  token                │
                            │ FK  simulationId         │
                            │ FK  userId               │
                            │ UK  (simulationId,userId)│
                            │     emailSentAt          │
                            │     openedAt             │
                            │     clickedAt            │
                            │     submittedAt          │
                            │     reportedAt           │
                            └──────────────────────────┘

       │
       │  1:N  createdBy
       │
       ▼
┌──────────────────────┐       ┌──────────────────────────┐
│   TrainingModule     │       │    TrainingProgress      │
│──────────────────────│       │──────────────────────────│
│ PK  _id              │◄─FK──│ PK  _id                  │
│ FK  createdBy        │       │ FK  userId               │
│ FK  simulation-      │       │ FK  moduleId             │
│     TemplateId       │       │ UK  (userId, moduleId)   │
│ FK  prerequisite-    │       │     status*              │
│     ModuleId (self)  │       │     score                │
│     title,summary    │       │     attempts             │
│     content (MD)     │       │     completedAt          │
│     category         │       └──────────────────────────┘
│     estimatedMinutes │
│     quiz[] (embedded)│
│     published        │
│     videoUrl         │
│     featuredImage    │
└──────────────────────┘
```

**Legend:**
- `PK` = Primary Key (MongoDB `_id`, ObjectId)
- `UK` = Unique Key / Index
- `FK` = Foreign Key reference
- `*` = Enumerated type
- `◄──1:N───▶` = One-to-many relationship
- Embedded subdocuments = `quiz[]` within TrainingModule

---

## 3. Collection: `users`

**Schema File:** `src/lib/models/User.ts`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Required, trim | Full display name |
| `email` | String | Required, unique, lowercase, trim | Login identifier |
| `passwordHash` | String | Required | bcrypt hash (cost factor 10) |
| `role` | String Enum | `admin` \| `student`, default: `student` | Authorization role |
| `department` | String | Default: `"General"` | Department grouping for reports |
| `jobTitle` | String | Optional | Free-text job title |
| `active` | Boolean | Default: `true` | Soft-disable; inactive users cannot log in |
| `createdAt` | Date | Auto (timestamps) | Account creation timestamp |
| `updatedAt` | Date | Auto (timestamps) | Last modification timestamp |

**Mongoose indexes:**
- `{ email: 1 }` — unique index (enforced by `unique: true`)

---

## 4. Collection: `templates`

**Schema File:** `src/lib/models/Template.ts`

Phishing email template with a simulated "credential-harvest" landing page.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | PK |  |
| `name` | String | Required, trim | Admin-visible label |
| `category` | String | Default: `"General"` | Taxonomy (IT / HR / BEC...) |
| `difficulty` | String Enum | `easy` \| `medium` \| `hard`, default: `medium` | Threat sophistication level |
| `fromName` | String | Required | Display name in email "From" header |
| `fromEmail` | String | Required | Email address in "From" (often look-alike domain) |
| `subject` | String | Required | Email subject line |
| `htmlBody` | String | Required | HTML email body with `{{first_name}}`, `{{tracking_link}}` placeholders |
| `landingType` | String Enum | `generic` \| `microsoft` \| `portal` \| `hr` \| `invoice` \| `social` | UI theme on `/phish/[token]` |
| `landingHeadline` | String | Default: generic headline | Revealed-stage title |
| `landingBody` | String | Default: `""` | Educational explanation shown after reveal |
| `redFlags` | String[] | Default: `[]` | Bullet-list of telltale signs for teachable moment |
| `createdBy` | ObjectId → User | Optional ref | Admin who authored template |
| `createdAt` / `updatedAt` | Date | Auto |  |

**Referenced by:**
- `Simulation.templateId` (required FK)
- `TrainingModule.simulationTemplateId` (optional post-course auto-phish trigger)

---

## 5. Collection: `simulations`

**Schema File:** `src/lib/models/Simulation.ts`

A single phishing campaign (one-shot send).

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | PK |  |
| `name` | String | Required, trim | Admin-visible campaign label |
| `description` | String | Optional |  |
| `templateId` | ObjectId → Template | Required, ref | The email template used |
| `status` | String Enum | `draft` \| `scheduled` \| `running` \| `completed`, default: `draft` | Lifecycle state |
| `targetDepartments` | String[] | Default: `[]` | Department filter snapshot |
| `targetUserIds` | ObjectId[] → User | Default: `[]`, ref | Concrete list of recipients at send time |
| `scheduledAt` | Date | Optional | Future send time (job-runner not yet wired) |
| `sentAt` | Date | Optional | Actual send timestamp |
| `completedAt` | Date | Optional | Manual completion marker |
| `createdBy` | ObjectId → User | Required, ref | Admin who launched |
| Timestamps | Date | Auto |  |

---

## 6. Collection: `simulationresults`

**Schema File:** `src/lib/models/SimulationResult.ts`

One row per **(simulation, recipient)** pair. The heart of click-tracking and scoring.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | PK |  |
| `simulationId` | ObjectId → Simulation | Required, ref | Parent campaign |
| `userId` | ObjectId → User | Required, ref | Recipient student |
| `token` | String | Required, **unique** | 32-hex-char identifier for tracking URLs |
| `emailSentAt` | Date | Optional | Timestamp of email dispatch |
| `openedAt` | Date | Optional | Set by tracking-pixel hit `/api/track/o/[token]` |
| `clickedAt` | Date | Optional | Set by link-redirect `/api/track/c/[token]` |
| `submittedAt` | Date | Optional | Set by fake-login POST `/api/track/s/[token]` |
| `reportedAt` | Date | Optional | Set by student report POST `/api/track/r/[token]` |
| Timestamps | Date | Auto |  |

**Indexes:**
- `{ token: 1 }` — unique (enforced at schema level)
- `{ simulationId: 1, userId: 1 }` — **unique compound index** prevents duplicate SimulationResult rows for the same user in the same campaign

**Design note:** The `token` field is the ONLY piece of data exposed to the student's browser / URL bar. The SimulationResult `_id`, student `userId`, and `simulationId` are never leaked in URLs — an attacker cannot enumerate recipients by guessing IDs.

---

## 7. Collection: `trainingmodules`

**Schema File:** `src/lib/models/TrainingModule.ts`

A self-contained security-awareness lesson with embedded quiz.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | PK |  |
| `title` | String | Required, trim |  |
| `summary` | String | Default: `""` | One-paragraph overview (card view) |
| `content` | String | Required | Markdown lesson body, rendered via react-markdown |
| `category` | String | Default: `"General"` | Taxonomy |
| `estimatedMinutes` | Number | Default: `5` | Displayed to student for planning |
| `quiz` | `IQuizQuestion[]` — **embedded subdocument** | Default: `[]` | Embedded to guarantee read consistency |
| `published` | Boolean | Default: `true` | Draft vs. student-visible |
| `videoUrl` | String | Default: `""` | Optional embedded video |
| `featuredImage` | String | Default: `""` | Optional card / header image (Cloudinary URL) |
| `simulationTemplateId` | ObjectId → Template | Optional ref | **Post-course auto-phish**: on quiz completion, auto-launch a simulation using this template |
| `prerequisiteModuleId` | ObjectId → TrainingModule | Optional self-ref | Locks this course until prerequisite is completed |
| `createdBy` | ObjectId → User | Optional ref | Admin author |
| Timestamps | Date | Auto |  |

### Embedded Subdocument: `IQuizQuestion`

| Field | Type | Constraints |
|---|---|---|
| `question` | String | Required |
| `options` | String[] | Min 2 entries |
| `correctIndex` | Number | Integer ≥ 0 (index into `options`) |

> `_id: false` is set on the sub-schema so quiz questions don't get auto-assigned ObjectIds (saves storage and noise).

---

## 8. Collection: `trainingprogresses`

**Schema File:** `src/lib/models/TrainingProgress.ts`

Per-student, per-module progress record — the join between user and course.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | PK |  |
| `userId` | ObjectId → User | Required, ref |  |
| `moduleId` | ObjectId → TrainingModule | Required, ref |  |
| `status` | String Enum | `not_started` \| `in_progress` \| `completed`, default: `not_started` | Lifecycle |
| `score` | Number | Optional | Percent 0–100 on best attempt |
| `attempts` | Number | Default: `0` | Number of quiz submissions |
| `completedAt` | Date | Optional | Timestamp of first successful completion |
| Timestamps | Date | Auto |  |

**Indexes:**
- `{ userId: 1, moduleId: 1 }` — **unique compound index** → one progress row per (student, course)

---

## 9. Collection: `notifications`

**Schema File:** `src/lib/models/Notification.ts`

In-app student notification.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | PK |  |
| `userId` | ObjectId → User | Required, ref | Recipient student |
| `type` | String Enum | `remediation` \| `badge_earned` \| `course_available` | Changes icon/color theme |
| `title` | String | Required | Bold one-liner |
| `message` | String | Required | Detail line |
| `link` | String | Optional | Deep link (e.g., `/dashboard/student/training/{id}`) |
| `read` | Boolean | Default: `false` | Marked read via PATCH `/api/me/notifications` |
| Timestamps | Date | Auto |  |

**Indexes:**
- `{ userId: 1, read: 1, createdAt: -1 }` — Optimizes the common query "fetch latest unread notifications for user X"

---

## 10. Collection: `badges`

**Schema File:** `src/lib/models/Badge.ts`

Gamification awards — achievements unlocked by behavior.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | PK |  |
| `userId` | ObjectId → User | Required, ref | Awardee |
| `badgeType` | String Enum | `first_course` \| `all_courses` \| `first_report` \| `phish_survivor` \| `perfect_score` | Specific achievement |
| `earnedAt` | Date | Default: `Date.now()` | Award timestamp |
| Timestamps | Date | Auto |  |

**Indexes:**
- `{ userId: 1, badgeType: 1 }` — **unique compound index** → a badge can only be awarded once per student. Award logic uses `try/catch` on duplicate-key error instead of SELECT-before-INSERT (race-condition safe, 1 round-trip instead of 2).

### Badge Unlock Conditions

| Badge | Trigger | Location |
|---|---|---|
| `first_course` | Completes any training module for the first time | POST `/api/training/[id]/progress` |
| `perfect_score` | Scores 100% on a quiz | POST `/api/training/[id]/progress` |
| `all_courses` | Completes every published module | POST `/api/training/[id]/progress` |
| `first_report` | Reports a phishing email via `/r/[token]` | POST `/api/track/r/[token]` |
| `phish_survivor` | Received ≥3 simulations AND clicked 0 of them | POST `/api/track/r/[token]` (checked at report time) |

---

## 11. Index Summary

| Collection | Index | Type | Purpose |
|---|---|---|---|
| users | `{ email: 1 }` | Unique | Login lookup, prevent duplicates |
| templates | (default `_id`) | — |  |
| simulations | (default `_id`) | — |  |
| simulationresults | `{ token: 1 }` | Unique | URL-token resolution in tracking routes |
| simulationresults | `{ simulationId: 1, userId: 1 }` | Unique | One row per (campaign, recipient) |
| simulationresults | (implied `simulationId`) | — | Aggregation: stats per campaign |
| simulationresults | (implied `userId`) | — | Aggregation: stats per student |
| trainingmodules | (default `_id`) | — |  |
| trainingprogresses | `{ userId: 1, moduleId: 1 }` | Unique | One progress row per (student, course) |
| trainingprogresses | (implied `userId`) | — | Student completion counts |
| trainingprogresses | `{ status: "completed", moduleId: {...} }` | Aggregation match | Admin: completions per module |
| notifications | `{ userId: 1, read: 1, createdAt: -1 }` | Compound | Student inbox query |
| badges | `{ userId: 1, badgeType: 1 }` | Unique | One award per achievement |

---

## 12. Data Integrity & Referential Patterns

MongoDB is schemaless at the wire level — referential integrity is enforced at the application layer:

| Integrity Rule | Enforcement Location |
|---|---|
| **No orphan SimulationResults** | `DELETE /api/simulations/[id]` → `SimulationResult.deleteMany({simulationId})` + `Simulation.findByIdAndDelete` in a single request handler |
| **No orphan TrainingProgress on module delete** | `DELETE /api/training/[id]` → deletes both `TrainingModule` and all `TrainingProgress` for it |
| **Template cannot be deleted if referenced by Simulation** | `DELETE /api/templates/[id]` → `Simulation.exists({templateId})` check → returns 409 Conflict if in use |
| **Students only see published modules** | `GET /api/training` → student branch filters `{ published: true }` |
| **Course prerequisite gating** | `GET /api/training/[id]` → student branch checks prerequisite completion and returns `{ locked: true, prerequisite: {...} }` |
| **Unique email** | Mongoose schema `unique: true` + application-level `User.findOne` check (signup) + `catch (code 11000)` fallback |
| **Only admins can create admin-owned content** | Every create API uses `createdBy: session.user.id` → admin-scoped; list APIs filter to adminIds |
