/* Run with: npm run seed:library */
import "dotenv/config";
import mongoose from "mongoose";
import Template from "./models/Template";
import TrainingModule from "./models/TrainingModule";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env first.");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB for seeding System Library...");

  const templates = [
    {
      name: "[System] Microsoft Password Reset",
      category: "IT / Helpdesk",
      difficulty: "easy",
      fromName: "Microsoft Account Team",
      fromEmail: "security@microsoft-alerts-portal.com",
      subject: "Security Alert: Password expires in 24 hours",
      htmlBody: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: auto; padding: 20px; border: 1px solid #e1e1e1;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" width="108" style="margin-bottom: 20px;" />
        <h2 style="color: #323130; font-weight: 600; margin-top: 0;">Password Expiry Notice</h2>
        <p style="color: #323130;">Hi {{first_name}},</p>
        <p style="color: #323130;">Your Microsoft 365 organization password is set to expire in 24 hours. To maintain access to your email and files, please keep your current password or choose a new one.</p>
        <p style="margin: 32px 0;">
          <a href="{{tracking_link}}" style="background-color: #0078D4; color: #fff; padding: 10px 20px; border-radius: 2px; text-decoration: none; font-weight: 600; display: inline-block;">Keep Current Password</a>
        </p>
        <p style="color: #605E5C; font-size: 12px;">This is a mandatory security update from your IT department.</p>
      </div>`,
      landingType: "microsoft",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "This email impersonated Microsoft perfectly, but the sender email domain was a fake. Always check the sender address carefully and never click links to reset your password—navigate to your company's portal directly.",
      redFlags: [
        "Sender domain (microsoft-alerts-portal.com) is fake",
        "Creates urgency (expires in 24 hours)",
        "Link leads to a non-Microsoft login page"
      ],
    },
    {
      name: "[System] MFA Re-enrollment",
      category: "Security",
      difficulty: "medium",
      fromName: "IT Security",
      fromEmail: "noreply@secureguard-auth-update.com",
      subject: "ACTION REQUIRED: Re-enroll your Authenticator App",
      htmlBody: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border-top: 4px solid #005A9E; padding: 20px; background: #f9f9f9;">
        <p>Dear {{first_name}},</p>
        <p>We are upgrading our internal security systems. Your current Multi-Factor Authentication (MFA) token will expire by end of day.</p>
        <p>Please re-sync your authenticator app to ensure you aren't locked out of the VPN and company portals tomorrow morning.</p>
        <p style="text-align:center;margin:30px 0">
          <a href="{{tracking_link}}" style="background:#005A9E;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">Re-sync Authenticator</a>
        </p>
        <p style="font-size: 12px; color: #666;">IT Support Team<br/>Ticket #INC-89321</p>
      </div>`,
      landingType: "generic",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "Attackers often use fake security alerts to trick you into bypassing MFA. Notice the generic ticket number and the fake sender domain.",
      redFlags: [
        "Unfamiliar sender domain",
        "Threatens loss of access (locked out of VPN)",
        "Generic ticket number"
      ],
    },
    {
      name: "[System] SharePoint Document Share",
      category: "Internal Tool",
      difficulty: "hard",
      fromName: "SharePoint",
      fromEmail: "no-reply@sharepoint-online-collab.com",
      subject: "A document has been shared with you: 'Q3_Bonus_Allocations.xlsx'",
      htmlBody: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; padding: 20px;">
        <p style="color: #333;"><strong>Finance Dept</strong> shared a file with you.</p>
        <div style="border: 1px solid #eaeaea; border-radius: 4px; padding: 16px; margin: 20px 0; display: flex; align-items: center;">
          <div style="background: #107C41; color: white; padding: 8px 12px; font-weight: bold; border-radius: 4px; margin-right: 15px;">X</div>
          <div>
            <h4 style="margin: 0; color: #333;">Q3_Bonus_Allocations.xlsx</h4>
            <p style="margin: 4px 0 0; font-size: 12px; color: #666;">This link only works for the direct recipients of this message.</p>
          </div>
        </div>
        <p style="margin: 24px 0;">
          <a href="{{tracking_link}}" style="background-color: #0078D4; color: #fff; padding: 10px 20px; border-radius: 2px; text-decoration: none; font-weight: 600; display: inline-block;">Open</a>
        </p>
      </div>`,
      landingType: "microsoft",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "Curiosity is a powerful weapon for attackers. Fake 'bonus' or 'salary' documents are heavily used to steal credentials because employees want to see the information immediately.",
      redFlags: [
        "Fake SharePoint sender domain",
        "Highly sensitive file shared generically by 'Finance Dept'",
        "Preys on curiosity and greed"
      ],
    },
    {
      name: "[System] Facebook / Meta Business Alert",
      category: "Social Media",
      difficulty: "medium",
      fromName: "Meta Business Support",
      fromEmail: "support@business-meta-alert.com",
      subject: "Your advertising account has been restricted",
      htmlBody: `<div style="font-family: Helvetica, Arial, sans-serif; max-width: 520px; margin: auto; background: #fff; border: 1px solid #ddd; padding: 30px;">
        <h2 style="color: #1c2b33; font-size: 20px; margin-top: 0;">Business Account Restricted</h2>
        <p style="color: #1c2b33;">Hi {{first_name}},</p>
        <p style="color: #1c2b33;">We detected unusual activity on your Meta Business Manager. To protect your payment methods, your ad campaigns have been paused.</p>
        <p style="color: #1c2b33;">If you believe this is a mistake, you can request a review by verifying your identity within 24 hours.</p>
        <p style="margin: 30px 0;">
          <a href="{{tracking_link}}" style="background-color: #1877f2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Request Review</a>
        </p>
        <p style="color: #8a8d91; font-size: 12px;">Meta Platforms, Inc., Attention: Community Support, 1 Hacker Way, Menlo Park, CA 94025</p>
      </div>`,
      landingType: "social",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "Attackers target marketing and social media managers with fake Meta alerts to steal access to corporate pages and ad spend. Always verify restrictions by logging into Meta Business Suite directly.",
      redFlags: [
        "Sender domain is business-meta-alert.com, not facebook.com or meta.com",
        "Threatens that campaigns are paused (panic)",
        "Urgency (24 hours)"
      ],
    },
    {
      name: "[System] Amazon Delivery Failure",
      category: "Personal / E-commerce",
      difficulty: "easy",
      fromName: "Amazon Fulfillment",
      fromEmail: "auto-confirm@amazon-fulfillment-update.com",
      subject: "Action needed: We could not deliver your package",
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #FF9900; margin: 0;">amazon</h1>
        </div>
        <p>Hello {{first_name}},</p>
        <p>We tried to deliver your package today, but the delivery address was incomplete. Your package is being held at our fulfillment center.</p>
        <p>Please update your delivery address within 48 hours to avoid the package being returned to the sender.</p>
        <p style="text-align:center;margin:30px 0">
          <a href="{{tracking_link}}" style="background:#FF9900;color:#111;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block; font-weight: bold;">Update Address</a>
        </p>
      </div>`,
      landingType: "generic",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "Personal email lures (like Amazon deliveries) frequently bypass corporate filters. Never click delivery updates from your work email unless you specifically ordered work supplies.",
      redFlags: [
        "Sender domain is a fake Amazon domain",
        "Sent to your work email, not personal",
        "Demands an address update to avoid return"
      ],
    },
    {
      name: "[System] HR Benefits Confirmation",
      category: "HR",
      difficulty: "medium",
      fromName: "HR Benefits Team",
      fromEmail: "benefits@hr-secure-portal.com",
      subject: "Action Required: Confirm your 2024 Benefits Selection",
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2c3e50;">Benefits Enrollment Confirmation</h2>
        <p>Hi {{first_name}},</p>
        <p>Your benefits selection window closes on Friday. Our system shows you have not yet confirmed your elections for the upcoming year.</p>
        <p>If you do not confirm, you will be automatically enrolled in the standard high-deductible plan.</p>
        <p style="margin: 30px 0; text-align: center;">
          <a href="{{tracking_link}}" style="background:#27ae60;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">Review Benefits</a>
        </p>
      </div>`,
      landingType: "hr",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "HR benefits emails are highly clicked because they impact your personal finances and healthcare. Always access your HR portal directly via your company's intranet.",
      redFlags: [
        "Fake HR sender domain",
        "Threatens a negative consequence (high deductible plan)",
        "Generic sender 'HR Benefits Team'"
      ],
    },
    {
      name: "[System] Payroll Action Required",
      category: "HR / Finance",
      difficulty: "hard",
      fromName: "Payroll Dept",
      fromEmail: "payroll@workday-payroll-notices.com",
      subject: "Urgent: Direct Deposit Information Expiring",
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 20px; border-left: 4px solid #e74c3c; background: #fdfefe;">
        <p>Hi {{first_name}},</p>
        <p>We received an automated notice from your bank rejecting your most recent direct deposit transfer.</p>
        <p>To ensure your upcoming paycheck is processed on time, please verify your routing and account numbers immediately.</p>
        <p style="margin: 30px 0;">
          <a href="{{tracking_link}}" style="background:#e74c3c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block; font-weight: bold;">Verify Direct Deposit</a>
        </p>
        <p style="font-size: 12px; color: #7f8c8d;">This is an automated message. Please do not reply.</p>
      </div>`,
      landingType: "hr",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "Payroll scams are incredibly dangerous. Attackers use this lure to capture your login, then immediately change your real direct deposit to their own bank account before payday.",
      redFlags: [
        "Fake Workday/payroll domain",
        "Claims a bank rejection (highly panic-inducing)",
        "Pushes you to verify sensitive routing numbers via a link"
      ],
    },
    {
      name: "[System] Invoice / Payment Request",
      category: "Finance",
      difficulty: "hard",
      fromName: "Accounts Receivable",
      fromEmail: "invoicing@quickbooks-secure-pay.com",
      subject: "Overdue Invoice #INV-29931",
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 20px;">
        <div style="background: #f4f6f7; padding: 20px; border-radius: 8px;">
          <h2 style="margin-top: 0; color: #2c3e50;">Invoice #INV-29931 is Overdue</h2>
          <p>Dear {{first_name}},</p>
          <p>This is a second reminder that the attached invoice for $4,250.00 is now 15 days past due. Please process payment immediately to avoid service interruption.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{tracking_link}}" style="background:#2980b9;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block">View Invoice Document</a>
          </p>
        </div>
      </div>`,
      landingType: "invoice",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "Fake invoices are frequently used to deploy ransomware or steal credentials from finance teams. Never open unexpected invoices without verifying the vendor independently.",
      redFlags: [
        "Fake accounting domain (quickbooks-secure-pay)",
        "Unexpected large bill ($4,250)",
        "Threatens service interruption"
      ],
    },
    {
      name: "[System] CEO Urgent Message",
      category: "BEC",
      difficulty: "hard",
      fromName: "CEO",
      fromEmail: "ceo-office@secureguard-executives.com",
      subject: "Are you available? (Urgent request)",
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <p>{{first_name}},</p>
        <p>I'm in a board meeting right now and can't take calls. I need you to handle a quick, confidential task for me right away.</p>
        <p>Please log in and confirm you received this so I can send the wire transfer details.</p>
        <p><a href="{{tracking_link}}">Confirm availability here</a></p>
        <p>Sent from my iPhone</p>
      </div>`,
      landingType: "generic",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "This is a Business Email Compromise (BEC) attempt. Attackers impersonate executives, claim they can't be reached by phone, and demand urgent financial action.",
      redFlags: [
        "Fake executive domain",
        "Requests secrecy and urgency",
        "Mentions a wire transfer out of the blue"
      ],
    },
    {
      name: "[System] IT Helpdesk Suspension Notice",
      category: "IT / Helpdesk",
      difficulty: "medium",
      fromName: "Helpdesk Administrator",
      fromEmail: "admin@it-support-ticket-system.com",
      subject: "Ticket #9482: Account Deactivation Initiated",
      htmlBody: `<div style="font-family: Courier New, Courier, monospace; max-width: 520px; margin: auto; background: #000; color: #0f0; padding: 20px;">
        <p>SYSTEM ALERT: Account {{first_name}} flagged for inactivity.</p>
        <p>Deactivation scheduled in 2 hours.</p>
        <p>To abort deactivation, authenticate below:</p>
        <p><a href="{{tracking_link}}" style="color: #fff; background: #f00; text-decoration: none; padding: 5px 10px;">> ABORT_DEACTIVATION</a></p>
      </div>`,
      landingType: "portal",
      landingHeadline: "You just fell for a simulated phishing test",
      landingBody: "This email uses a scary, technical-looking layout to intimidate you into clicking quickly. Legitimate IT departments do not send hostile 'deactivation' alerts with 2-hour warnings.",
      redFlags: [
        "Unprofessional/unusual email design",
        "Extreme urgency (2 hours)",
        "Fake IT support domain"
      ],
    }
  ];

  for (const t of templates) {
    const exists = await Template.findOne({ name: t.name, isSystem: true });
    if (!exists) {
      await Template.create({ ...t, isSystem: true });
      console.log(`Created system template: ${t.name}`);
    } else {
      await Template.updateOne({ _id: exists._id }, { $set: t });
      console.log(`Updated system template: ${t.name}`);
    }
  }

  const modules = [
    {
      title: "[System] Spotting Phishing Emails",
      summary: "Learn the core red flags that show up in almost every phishing attempt.",
      category: "Phishing Basics",
      estimatedMinutes: 6,
      content: `Phishing emails try to get you to click a link, open an attachment, or share credentials by impersonating someone you trust.\n\nLook for these signals before you act on any email:\n- Sender address that looks close to, but not exactly, a real domain\n- Urgency or fear ("your account will be closed", "action required today")\n- Requests to click a link to "verify" or "reset" something\n- Generic greetings instead of your actual name\n- Unexpected attachments, especially .zip or .exe files\n- Requests for money, gift cards, or credentials that bypass normal process\n\nWhen in doubt, don't click. Verify the request through a separate, known channel — like calling the person directly or opening your company portal manually instead of following an email link. Report anything suspicious using your organization's "Report Phishing" button so security teams can warn others.`,
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
      ],
    },
    {
      title: "[System] Reporting Suspicious Activity",
      summary: "What to do — and who to tell — the moment something feels off.",
      category: "Incident Response",
      estimatedMinutes: 4,
      content: `Fast reporting limits the damage of a real phishing attack. If you click a suspicious link, enter credentials somewhere you shouldn't have, or just aren't sure — report it immediately rather than staying quiet.\n\nWhat to do:\n1. Don't panic, and don't try to "fix it" yourself by deleting evidence\n2. Use your organization's "Report Phishing" button or contact security directly\n3. If you entered a password, change it right away and enable MFA\n4. Note what you clicked and what happened, security teams need those details\n5. Warn nearby teammates if the same email likely went to others\n\nReporting quickly, even for something that turns out to be harmless, helps your security team spot real campaigns faster and is always the right call.`,
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
      ],
    },
    {
      title: "[System] Password Security Essentials",
      summary: "Best practices for creating strong passwords and using multi-factor authentication.",
      category: "Passwords",
      estimatedMinutes: 5,
      content: `Passwords are the keys to your digital life. Attackers use automated tools to guess weak passwords or reuse passwords exposed in other breaches.\n\nBest Practices:\n- Use a password manager to generate and store long, unique passwords for every site.\n- Never reuse your work password on personal accounts.\n- Enable Multi-Factor Authentication (MFA) everywhere possible. It stops 99% of automated attacks.\n- Passphrases (like combining random words) are easier to remember and harder to crack than short complex passwords.\n- Don't share passwords via email, chat, or sticky notes.`,
      quiz: [
        {
          question: "What is the most effective way to prevent unauthorized access even if your password is stolen?",
          options: [
            "Changing your password every 30 days",
            "Using a mix of uppercase and lowercase letters",
            "Enabling Multi-Factor Authentication (MFA)",
            "Not telling anyone your password",
          ],
          correctIndex: 2,
        }
      ],
    },
    {
      title: "[System] Social Engineering & BEC",
      summary: "How attackers manipulate humans instead of hacking systems.",
      category: "Advanced Threats",
      estimatedMinutes: 7,
      content: `Social engineering is the art of manipulating people so they give up confidential information. Business Email Compromise (BEC) is a form of social engineering where an attacker compromises or impersonates a corporate email account to conduct fraud.\n\nKey Tactics:\n- Authority: Pretending to be the CEO or a high-ranking executive demanding an urgent wire transfer.\n- Scarcity: "This invoice is past due and services will be cut off today."\n- Familiarity: Researching your LinkedIn to reference your recent projects or coworkers.\n\nDefense:\nAlways verify unusual requests for money, sensitive data, or password changes out of band. If the "CEO" emails you for a gift card, call or text their known phone number to verify, even if the email looks perfectly legitimate.`,
      quiz: [
        {
          question: "If you receive an urgent email from your CEO asking for a wire transfer to a new vendor, what should you do?",
          options: [
            "Process it immediately to avoid making the CEO wait",
            "Reply to the email to confirm the details",
            "Verify the request through a secondary channel, like a phone call or Slack message",
            "Forward it to the IT helpdesk",
          ],
          correctIndex: 2,
        }
      ],
    },
    {
      title: "[System] Safe Web Browsing",
      summary: "Keep your devices safe while browsing the internet and downloading files.",
      category: "General Security",
      estimatedMinutes: 4,
      content: `Your web browser is the main gateway between your device and the internet. Malicious websites can trick you into downloading malware or giving away credentials.\n\nGuidelines:\n- Look for the padlock (HTTPS) on login pages, but remember: scammers can use HTTPS too. It just means the connection is encrypted.\n- Avoid downloading cracked software, free media players, or suspicious browser extensions.\n- Keep your browser and OS updated to the latest version. Updates patch known security vulnerabilities.\n- Do not ignore browser warnings like "This site ahead contains malware."\n- On public Wi-Fi (like a coffee shop), use a VPN to encrypt your traffic.`,
      quiz: [
        {
          question: "If a website has a padlock (HTTPS) in the address bar, what does that guarantee?",
          options: [
            "The website is completely safe and not a scam",
            "The connection between your browser and the site is encrypted",
            "The website is owned by a legitimate registered business",
            "The website cannot download malware to your computer",
          ],
          correctIndex: 1,
        }
      ],
    }
  ];

  for (const m of modules) {
    const exists = await TrainingModule.findOne({ title: m.title, isSystem: true });
    if (!exists) {
      await TrainingModule.create({ ...m, isSystem: true });
      console.log(`Created system module: ${m.title}`);
    } else {
      await TrainingModule.updateOne({ _id: exists._id }, { $set: m });
      console.log(`Updated system module: ${m.title}`);
    }
  }

  console.log("\nSystem Library Seed Complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
