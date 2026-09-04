# SecureGuard — Platform Guide & Operational Overview

> **A Comprehensive Guide to SecureGuard: How the Architecture, Phishing Simulations, Training Labs, and Resilience Scoring Work Together.**

---

## 1. Executive Summary

**SecureGuard** is an enterprise-grade Cybersecurity Awareness and Automated Phishing Simulation platform. 

Traditional cybersecurity training fails because reading a static article once a year does not prepare employees for real-world social engineering attacks. SecureGuard bridges this gap by combining **two defense pillars**:

1. **Active Real-World Testing**: Automated, realistic phishing drills sent directly to employees' actual inboxes to measure behavioral vulnerability.
2. **Interactive Hands-On Learning**: Educational courses equipped with browser-based threat inspection labs where students practice identifying red flags before taking certification quizzes.

```
       ┌────────────────────────────────────────────────────────┐
       │                 The SecureGuard Cycle                  │
       └───────────────────────────┬────────────────────────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             ▼                                           ▼
   [ Real-World Inbox Drill ]                  [ Training & Practice ]
   • Unannounced test email                    • Curated educational courses
   • Tracked link click                        • Hands-on sandbox inspection
   • Credential harvest test                   • Multiple-choice quizzes
             │                                           │
             ▼                                           ▼
      Did they fall for it?                      Earns Certificate &
      • Reported ➔ Score +50                     Score Boost
      • Compromised ➔ Auto-remediation           
             │                                           │
             └─────────────────────┬─────────────────────┘
                                   │
                                   ▼
                   [ Organizational Resilience Score ]
                   • Live company-wide risk analytics
                   • Vulnerable department breakdown
```

---

## 2. Core Concepts: Training vs. Templates vs. Simulations

To understand SecureGuard, it helps to distinguish the three main building blocks:

| Concept | What It Is | Purpose | Where It Lives |
| :--- | :--- | :--- | :--- |
| **Training Module** | An educational course or lesson. | Teaches students concepts (e.g., password safety, spear phishing, mobile security). Includes Markdown text, reading time, video links, and a quiz. | `/dashboard/admin/training` (Admin)<br>`/dashboard/student/training` (Student) |
| **Template** | A phishing attack blueprint. | Defines what a fake phishing email looks like (sender name, spoofed email, urgency subject, deceptive HTML body, fake login landing page, and a list of red flags). | `/dashboard/admin/templates` |
| **Simulation Campaign** | An active attack drill dispatched to users. | Uses a **Template** to generate personalized tracking links and send real emails to targeted students/departments. Tracks opens, clicks, credential entries, and reports. | `/dashboard/admin/simulations` |

---

## 3. User Roles & Experiences

SecureGuard provides two completely separate dashboard experiences depending on role:

### A. The Administrator (`role: "admin"`)
* **Overview**: Top-level executive metrics (overall resilience score, total students tested, active campaigns, compromise rate).
* **Simulations**: Launch and manage phishing campaigns targeted by department or company-wide. View real-time tracking (how many opened, clicked, submitted passwords, or reported).
* **Templates**: Create and edit attack lures (e.g., Microsoft Password Expiry, Urgent CEO Wire, Package Delivery Failure).
* **Training**: Author educational courses, embed quizzes, and attach phishing templates for interactive student labs.
* **Students**: View all employees, their individual risk ratings, courses completed, and simulation track records.
* **Reports**: Department-by-department vulnerability breakdowns and trend lines.

### B. The Student / Employee (`role: "student"`)
* **Overview**: Personal resilience score (0–100), active training assignments, recent simulated emails feed, and earned achievement badges.
* **Training Hub**: Access to published courses. Students read lesson content, test their eyes in the **Threat Inspection Sandbox**, and pass the quiz to earn downloadable PDF certificates.
* **Email Inbox**: Receives unannounced phishing simulation emails. If they spot the deception, they report it; if they fall for it, they receive instant guidance.
* **Profile**: View earned certificates, track personal progress, and review remediation history.

---

## 4. How the Systems Work (Under the Hood)

### 4.1. The Simulation Campaign Lifecycle

```
[Admin Launches Campaign]
         │
         ▼
[SecureGuard Generates Unique Token per Student]
         │
         ▼
[Dispatches Real Email via SMTP (Gmail / Custom Server)]
         │
         ├──────────────────────────────────────────────────────┐
         ▼                                                      ▼
[Student Opens Email]                                  [Student Reports Phish]
(1x1 Tracking Pixel fires: `/api/track/o/[token]`)     (Status updated to "Reported")
         │                                             (Resilience Score increases!)
         ▼                                                      
[Student Clicks Suspicious Link]
(Redirect tracker fires: `/api/track/c/[token]`)
(Takes user to `/phish/[token]`)
         │
         ▼
[Fake Login Landing Page Displayed]
(e.g., Microsoft 365, HR portal login)
         │
         ├──────────────────────────────────────────────────────┐
         ▼                                                      ▼
[Student Leaves / Reports]                             [Student Submits Password]
(Logged as "Clicked Only")                             (Credential test fires: `/api/track/s/[token]`)
                                                                │
                                                                ▼
                                                       [Instant Teachable Moment]
                                                       • Immediate reveal screen
                                                       • Red Flags breakdown
                                                       • Auto-enrolled in remedial training
```

1. **Dispatch**: The admin picks a Template (e.g. *IT Password Expiry*) and a Target Department (e.g. *Finance*). SecureGuard generates a unique cryptographic tracking token for each student.
2. **Delivery**: The system connects to the configured SMTP server and sends a realistic email to the student's real inbox.
3. **Tracking**:
   * **Open Tracking**: An invisible tracking pixel (`/api/track/o/[token]`) records the exact timestamp the email was opened.
   * **Click Tracking**: Links route through `/api/track/c/[token]` which marks the student as having clicked and forwards them to the simulated landing page (`/phish/[token]`).
   * **Credential Capture Simulation**: If the student enters information into the fake login form, SecureGuard captures that a submission occurred (`submittedAt`), **never stores the actual password**, and immediately transitions to the educational reveal screen.
   * **Reporting**: If the student reports the phish via their dashboard or tracking link, their record updates to `reportedAt` and their score rises.

---

### 4.2. In-Course Interactive Simulation Lab

SecureGuard includes a **Threat Inspection Sandbox** embedded directly into training courses.

```
+--------------------------------------------------------------------+
|  IN-COURSE SIMULATION LAB                                          |
+--------------------------------------------------------------------+
|  Sender: IT Support Desk <it-support@secureguard-corp-alerts.com>  |
|  Subject: Action required: your password expires today             |
|                                                                    |
|  "Please verify your credentials immediately:"                     |
|  [ Verify My Account ] <--- Hover reveals: '#fake-destination'     |
|                                                                    |
|  [ Report as Phishing (Safe) ]      [ Mark Legitimate ]            |
+--------------------------------------------------------------------+
```

* **How it works**: When an admin links a Template to a Training Course, students see the mock email client directly below the lesson article.
* **Hover Inspector**: When hovering over links or buttons, the real spoofed URL destination is highlighted in red.
* **Active Triage**: The student decides whether to report the email as phishing or mark it legitimate.
* **Immediate Deconstruction**: Upon decision, the lab displays a comprehensive breakdown of all **Red Flags** (e.g., sender domain discrepancies, artificial urgency, generic greetings) and allows the student to preview what the attacker's fake credential harvesting page looked like in a safe modal.

---

### 4.3. The Automated Remediation Loop

SecureGuard connects testing and training in a continuous loop:
1. When an employee falls for a simulation (clicks link or submits credentials), their status is marked **Compromised**.
2. SecureGuard automatically assigns them the corresponding remedial Training Module.
3. Once the employee finishes the course and passes the quiz, their status is updated and their resilience score recovers.

---

## 5. Scoring & Resilience Calculation

An organization's security posture is quantified through the **Resilience Score (0 – 100)**:

$$\text{Resilience Score} = \text{Base (50)} + (\text{Training Completions} \times 15) + (\text{Reports} \times 10) - (\text{Clicks} \times 15) - (\text{Credential Submissions} \times 25)$$

* **Reporting a phishing email** awards positive points (+10).
* **Completing training courses** awards positive points (+15 per course).
* **Clicking a phishing link** deducts points (-15).
* **Entering credentials on a fake page** heavily deducts points (-25).
* The score is clamped between **0** (Critically Vulnerable) and **100** (Hardened Defense).

---

## 6. Technology Stack & Directory Structure

* **Framework**: Next.js 16 (App Router, Server Components, API routes)
* **Authentication**: Auth.js v5 (NextAuth) with JWT session cookies and role-based middleware (`/src/proxy.ts`)
* **Database**: MongoDB Atlas with Mongoose schemas
* **Email Engine**: Nodemailer with SMTP (e.g. Gmail App Passwords, SendGrid, Amazon SES)
* **Styling**: Tailwind CSS with custom cybersecurity theme (dark mode glassmorphism, HSL color tokens)

### Key File Locations:

```
secureguard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── simulations/          # Campaign launch and metrics APIs
│   │   │   ├── templates/            # Phishing template CRUD
│   │   │   ├── training/             # Course & quiz management APIs
│   │   │   ├── track/                # Open, Click, Submit, Report webhooks
│   │   │   └── admin/students/       # Student directory & analytics API
│   │   ├── dashboard/
│   │   │   ├── admin/                # Admin views (Simulations, Templates, Training, Students, Reports)
│   │   │   └── student/              # Student views (Overview, Training hub, Course viewer, Profile)
│   │   └── phish/[token]/            # Simulated phishing landing pages (Microsoft, HR, etc.)
│   ├── components/
│   │   └── dashboard/
│   │       ├── InteractiveSimulationLab.tsx  # In-course threat inspection sandbox
│   │       ├── Sidebar.tsx                   # Role-aware dashboard navigation
│   │       └── TrainingForm.tsx              # Course creation & template attachment form
│   └── lib/
│       ├── mailer.ts                 # Real email delivery via SMTP
│       ├── db.ts                     # MongoDB connection pooling
│       └── models/                   # Mongoose Schemas (User, Template, TrainingModule, SimulationResult)
└── docs/                             # Architecture, database design, and platform guides
```

---

## 7. Administrator Quick Start Guide

### Step 1: Log In to the Admin Portal
* URL: `http://localhost:3000/login`
* Default Admin Email: `admin@secureguard.local`
* Default Admin Password: `ChangeMe123!`

### Step 2: Review or Create Phishing Templates
* Navigate to **Templates** (`/dashboard/admin/templates`).
* Pre-seeded templates include *IT Password Expiry*, *Package Delivery Failure*, and *CEO Wire Transfer*.
* You can create custom templates with custom HTML bodies, spoofed senders, and realistic landing page forms.

### Step 3: Launch a Live Phishing Simulation
* Navigate to **Simulations** (`/dashboard/admin/simulations`).
* Click **"+ New Simulation"**.
* Enter a campaign name (e.g., *"Q3 Department Audit"*).
* Select an **Email Template** and choose a **Target Department** (or *"All"*).
* Click **"Launch Simulation"**. SecureGuard immediately sends real emails to target users via SMTP.

### Step 4: Monitor Campaign Results in Real Time
* Click on the active simulation in `/dashboard/admin/simulations`.
* Watch live metrics: **Total Targets**, **Emails Opened**, **Links Clicked**, **Credentials Submitted**, and **Phish Reported**.

### Step 5: Manage Courses & In-Course Labs
* Navigate to **Training** (`/dashboard/admin/training`).
* Create or edit a course.
* In the **"Attached Phishing Simulation"** dropdown, select a template.
* Students enrolled in the course will now get a hands-on sandbox directly inside their lesson.

---

## 8. Student Quick Start Guide

### Step 1: Log In as a Student
* URL: `http://localhost:3000/login`
* Example Student: `jamie.chen@secureguard.local` (Password: `Student123!`)
* Or your registered student account (e.g. `hyacinthjoseph15@gmail.com`).

### Step 2: Practice in the Training Hub
* Navigate to **Training** (`/dashboard/student/training`).
* Open a lesson (e.g. *Spotting Phishing Emails*).
* Read the guidance, use the **Threat Inspection Sandbox** to identify deceptive links, and complete the quiz to earn your **Certificate of Completion**.

### Step 3: Respond to Inbox Drills
* Check your real email inbox or the **Recent Simulated Emails** feed on your dashboard.
* If an email looks suspicious, click **"Report as Phishing"** to boost your personal resilience score and earn security badges.

---

## 9. Configuration & Environment Reference

All settings are managed via `.env`:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
AUTH_SECRET=your-secure-random-secret
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# Public URL used to build tracking links inside simulated emails
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Real Email Delivery (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM="SecureGuard Security Team <your-email@gmail.com>"
```

---

*SecureGuard — Transforming Human Error into Human Defense.*
