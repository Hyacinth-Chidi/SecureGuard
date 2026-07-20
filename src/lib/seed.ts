/* Run with: npm run seed */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User";
import Template from "./models/Template";
import TrainingModule from "./models/TrainingModule";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env first.");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB for seeding...");

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@secureguard.local").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Alex Admin";

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin",
      department: "Security",
      jobTitle: "Security Awareness Lead",
    });
    console.log(`Created admin: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  const sampleEmployees = [
    { name: "Jamie Chen", email: "jamie.chen@secureguard.local", department: "Finance", jobTitle: "Accounts Payable" },
    { name: "Morgan Diaz", email: "morgan.diaz@secureguard.local", department: "Engineering", jobTitle: "Software Engineer" },
    { name: "Priya Nair", email: "priya.nair@secureguard.local", department: "HR", jobTitle: "HR Generalist" },
    { name: "Sam O'Neill", email: "sam.oneill@secureguard.local", department: "Sales", jobTitle: "Account Executive" },
    { name: "Taylor Brooks", email: "taylor.brooks@secureguard.local", department: "Engineering", jobTitle: "DevOps Engineer" },
    { name: "Nina Petrov", email: "nina.petrov@secureguard.local", department: "Marketing", jobTitle: "Marketing Manager" },
  ];

  for (const emp of sampleEmployees) {
    const exists = await User.findOne({ email: emp.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash("Employee123!", 10);
      await User.create({ ...emp, passwordHash, role: "employee" });
      console.log(`Created employee: ${emp.email} / Employee123!`);
    }
  }

  const templates = [
    {
      name: "IT Password Expiry Notice",
      category: "IT / Helpdesk",
      difficulty: "easy",
      fromName: "IT Support Desk",
      fromEmail: "it-support@secureguard-corp-alerts.com",
      subject: "Action required: your password expires today",
      htmlBody: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <p>Hi {{first_name}},</p>
        <p>Our records show your network password expires today. To avoid being locked out of your account, please verify your credentials now.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="{{tracking_link}}" style="background:#1a5276;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Verify My Account</a>
        </p>
        <p>Thanks,<br/>IT Support Desk</p>
      </div>`,
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody:
        "This looked like an urgent IT notice, but the sender domain wasn't your company's real domain, and legitimate IT teams never ask you to re-enter your password through an emailed link. Always verify by going directly to your company's password portal or contacting IT through a known channel.",
      redFlags: [
        "Sender domain isn't the real company domain",
        "Creates urgency (\"expires today\")",
        "Asks you to click a link to \"verify\" credentials",
        "Generic greeting with no specific account details",
      ],
    },
    {
      name: "Package Delivery Failure",
      category: "Package Delivery",
      difficulty: "easy",
      fromName: "Delivery Notifications",
      fromEmail: "no-reply@parcel-track-updates.com",
      subject: "We couldn't deliver your package — action needed",
      htmlBody: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <p>Hello {{first_name}},</p>
        <p>We attempted to deliver your package today but were unable to complete delivery. Your package will be returned to sender in 24 hours unless you reschedule.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="{{tracking_link}}" style="background:#c0392b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Reschedule Delivery</a>
        </p>
        <p>Tracking ID: 7738-AXQ-291</p>
      </div>`,
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody:
        "Delivery-failure scams are one of the most common phishing lures because almost everyone is expecting a package. Before clicking, hover over links to check the real destination and go directly to the carrier's official site to track a package instead.",
      redFlags: [
        "Unfamiliar sender domain unrelated to any real carrier",
        "Vague tracking number with pressure to act in 24 hours",
        "Generic greeting, no specific delivery address",
      ],
    },
    {
      name: "CEO Urgent Wire Transfer",
      category: "Business Email Compromise",
      difficulty: "hard",
      fromName: "Jordan Lee (CEO)",
      fromEmail: "jordan.lee@secureguard-exec.com",
      subject: "Quick favor - are you at your desk?",
      htmlBody: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <p>{{first_name}},</p>
        <p>I'm heading into back-to-back meetings and need you to handle something confidential for me. Can you process an urgent wire transfer before end of day? Let me know you're available and I'll send the details.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="{{tracking_link}}" style="background:#1a5276;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Confirm Availability</a>
        </p>
        <p>Sent from my iPhone</p>
      </div>`,
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody:
        "This is a classic business email compromise (BEC) attempt: it impersonates an executive, requests secrecy and urgency, and pushes for a financial transaction outside normal approval channels. Always verify unusual executive requests by phone using a known number, never by replying to the email.",
      redFlags: [
        "Look-alike domain instead of the real company domain",
        "Urgency + confidentiality + a financial ask",
        "Bypasses normal approval process",
        "\"Sent from my iPhone\" used to explain brevity/typos",
      ],
    },
    {
      name: "HR Benefits Enrollment Deadline",
      category: "HR",
      difficulty: "medium",
      fromName: "HR Benefits Team",
      fromEmail: "benefits@secureguard-hr-portal.com",
      subject: "Final reminder: open enrollment closes tomorrow",
      htmlBody: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <p>Hi {{first_name}},</p>
        <p>This is your final reminder that open enrollment for benefits closes tomorrow at 5 PM. If you don't confirm your selections, you'll be automatically enrolled in the default plan.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="{{tracking_link}}" style="background:#117864;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Review My Benefits</a>
        </p>
      </div>`,
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody:
        "HR-themed phishing works because benefits decisions feel personal and time-sensitive. The giveaway here is the sender domain, which mimics but doesn't match your real company domain. When in doubt, navigate to your HR portal directly instead of clicking email links.",
      redFlags: [
        "Look-alike sender domain",
        "Deadline pressure with a consequence for inaction",
        "Link leads to an external domain, not your real HR system",
      ],
    },
  ];

  for (const t of templates) {
    const exists = await Template.findOne({ name: t.name });
    if (!exists) {
      await Template.create({ ...t, createdBy: admin._id });
      console.log(`Created template: ${t.name}`);
    }
  }

  const modules = [
    {
      title: "Spotting Phishing Emails",
      summary: "Learn the core red flags that show up in almost every phishing attempt.",
      category: "Phishing Basics",
      estimatedMinutes: 6,
      content: `Phishing emails try to get you to click a link, open an attachment, or share credentials by impersonating someone you trust.

Look for these signals before you act on any email:
- Sender address that looks close to, but not exactly, a real domain
- Urgency or fear ("your account will be closed", "action required today")
- Requests to click a link to "verify" or "reset" something
- Generic greetings instead of your actual name
- Unexpected attachments, especially .zip or .exe files
- Requests for money, gift cards, or credentials that bypass normal process

When in doubt, don't click. Verify the request through a separate, known channel — like calling the person directly or opening your company portal manually instead of following an email link. Report anything suspicious using your organization's "Report Phishing" button so security teams can warn others.`,
      quiz: [
        {
          question: "Which of these is the strongest sign an email might be phishing?",
          options: [
            "It was sent during business hours",
            "The sender's domain looks slightly different from your real company domain",
            "It includes your company's logo",
            "It was sent to multiple people",
          ],
          correctIndex: 1,
        },
        {
          question: "What should you do if an email creates urgency about your account expiring?",
          options: [
            "Click the link immediately to avoid losing access",
            "Reply asking for more details",
            "Go directly to the official site/portal yourself instead of clicking the email link",
            "Forward it to a coworker to check first",
          ],
          correctIndex: 2,
        },
        {
          question: "An email from your \"CEO\" urgently asks you to wire money and keep it confidential. What's the best move?",
          options: [
            "Process it quickly since it's the CEO",
            "Reply to the email asking for confirmation",
            "Verify by calling the CEO directly using a known phone number",
            "Forward the money request to finance without comment",
          ],
          correctIndex: 2,
        },
      ],
    },
    {
      title: "Password & Credential Hygiene",
      summary: "Best practices for creating and managing passwords that actually protect you.",
      category: "Account Security",
      estimatedMinutes: 5,
      content: `Weak or reused passwords are one of the easiest ways attackers get into accounts.

Key habits:
- Use a unique password for every account, never reuse passwords across sites
- Prefer long passphrases (12+ characters) over short complex ones
- Use a password manager to generate and store unique passwords
- Turn on multi-factor authentication (MFA) everywhere it's offered
- Never share your password over email, chat, or phone — no legitimate IT team will ask for it
- If you suspect a password was exposed, change it immediately and check for MFA on that account`,
      quiz: [
        {
          question: "Why is reusing the same password across multiple sites risky?",
          options: [
            "It makes passwords harder to remember",
            "If one site is breached, attackers can try that password on your other accounts",
            "Websites don't allow it",
            "It slows down login times",
          ],
          correctIndex: 1,
        },
        {
          question: "What's the best way to store many unique, strong passwords?",
          options: [
            "Write them in a notes app",
            "Use the same base password with small variations",
            "Use a password manager",
            "Memorize all of them",
          ],
          correctIndex: 2,
        },
      ],
    },
    {
      title: "Reporting Suspicious Activity",
      summary: "What to do — and who to tell — the moment something feels off.",
      category: "Incident Response",
      estimatedMinutes: 4,
      content: `Fast reporting limits the damage of a real phishing attack. If you click a suspicious link, enter credentials somewhere you shouldn't have, or just aren't sure — report it immediately rather than staying quiet.

What to do:
1. Don't panic, and don't try to "fix it" yourself by deleting evidence
2. Use your organization's "Report Phishing" button or contact security directly
3. If you entered a password, change it right away and enable MFA
4. Note what you clicked and what happened, security teams need those details
5. Warn nearby teammates if the same email likely went to others

Reporting quickly, even for something that turns out to be harmless, helps your security team spot real campaigns faster and is always the right call.`,
      quiz: [
        {
          question: "You accidentally entered your password on a suspicious login page. What should you do first?",
          options: [
            "Ignore it and hope nothing happens",
            "Change that password immediately and report it to security",
            "Wait a few days to see if anything unusual happens",
            "Only mention it if asked",
          ],
          correctIndex: 1,
        },
        {
          question: "Why should you report suspicious emails even if you're not sure they're malicious?",
          options: [
            "It's required for compliance paperwork",
            "It helps security teams detect and warn others about real campaigns faster",
            "It automatically deletes the email for everyone",
            "It's not important, only confirmed threats matter",
          ],
          correctIndex: 1,
        },
      ],
    },
  ];

  for (const m of modules) {
    const exists = await TrainingModule.findOne({ title: m.title });
    if (!exists) {
      await TrainingModule.create({ ...m, createdBy: admin._id });
      console.log(`Created training module: ${m.title}`);
    }
  }

  console.log("\nSeed complete.");
  console.log(`Admin login -> ${adminEmail} / ${adminPassword}`);
  console.log("Employee login -> any seeded employee email / Employee123!");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
