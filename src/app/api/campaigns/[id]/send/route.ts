import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import CampaignTarget from "@/lib/models/CampaignTarget";
import Template from "@/lib/models/Template";
import { requireAdmin } from "@/lib/apiAuth";
import { sendCampaignEmail } from "@/lib/mailer";
import { renderCampaignEmail } from "@/lib/email";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const campaign = await Campaign.findById(id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = await Template.findById(campaign.templateId);
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const targets = await CampaignTarget.find({ campaignId: id }).populate("userId", "name email");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let simulatedCount = 0;
  let realCount = 0;

  for (const target of targets) {
    const user = target.userId as unknown as { name: string; email: string };
    if (!user?.email) continue;

    const html = renderCampaignEmail({
      html: template.htmlBody,
      firstName: user.name.split(" ")[0] ?? "there",
      trackingClickUrl: `${baseUrl}/api/track/c/${target.token}`,
      trackingPixelUrl: `${baseUrl}/api/track/o/${target.token}`,
    });

    const result = await sendCampaignEmail({
      to: user.email,
      fromName: template.fromName,
      fromEmail: template.fromEmail,
      subject: template.subject,
      html,
    });

    if (result.simulated) simulatedCount++;
    else realCount++;

    target.emailSentAt = new Date();
    await target.save();
  }

  campaign.status = "running";
  campaign.sentAt = new Date();
  await campaign.save();

  return NextResponse.json({
    success: true,
    sent: targets.length,
    simulatedCount,
    realCount,
  });
}
