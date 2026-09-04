import nodemailer from "nodemailer";

interface SendArgs {
  to: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  html: string;
}

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

/**
 * Sends a simulated phishing email for a post-course simulation test.
 * If SMTP_* env vars are configured, a real email is delivered via nodemailer.
 * Otherwise the send is "simulated": the message is logged to the server
 * console so the rest of the product (tracking, reporting) works without
 * requiring an email provider.
 */
export async function sendSimulationEmail(args: SendArgs): Promise<{ simulated: boolean }> {
  if (!smtpConfigured()) {
    console.log(
      `[SecureGuard][simulated-send] To: ${args.to} | From: "${args.fromName}" <${args.fromEmail}> | Subject: ${args.subject}`
    );
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Sanitize the 'from' address:
  // With Gmail SMTP, the actual sending email address must match SMTP_USER to avoid rejection,
  // while args.fromName can still be custom (e.g. "HR Department", "Microsoft Security").
  let senderEmail = process.env.SMTP_USER || args.fromEmail;
  if (process.env.SMTP_FROM && !process.env.SMTP_HOST?.includes("gmail.com")) {
    const extracted = process.env.SMTP_FROM.match(/<([^>]+)>/)?.[1] || process.env.SMTP_FROM.replace(/["']/g, "").trim();
    if (extracted) senderEmail = extracted;
  }

  try {
    await transporter.sendMail({
      to: args.to,
      from: `"${args.fromName}" <${senderEmail}>`,
      subject: args.subject,
      html: args.html,
    });
    return { simulated: false };
  } catch (error) {
    console.error(`[SecureGuard][mailer-error] Failed to send email to ${args.to}:`, error);
    return { simulated: false };
  }
}
