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
 * Sends a simulated-phishing email. If SMTP_* env vars are configured, a real
 * email is delivered via nodemailer. Otherwise the send is "simulated": the
 * message is logged to the server console and the caller still records the
 * target as sent, so the rest of the product (tracking, reporting) works
 * without requiring an email provider to be wired up first.
 */
export async function sendCampaignEmail(args: SendArgs): Promise<{ simulated: boolean }> {
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

  await transporter.sendMail({
    to: args.to,
    from: `"${args.fromName}" <${process.env.SMTP_FROM ?? args.fromEmail}>`,
    subject: args.subject,
    html: args.html,
  });

  return { simulated: false };
}
