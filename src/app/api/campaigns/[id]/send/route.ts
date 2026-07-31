import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import CampaignTarget from "@/lib/models/CampaignTarget";
import Template from "@/lib/models/Template";
import { requireAdmin } from "@/lib/apiAuth";
import { sendCampaignEmail } from "@/lib/mailer";
import { renderCampaignEmail } from "@/lib/email";
import User from "@/lib/models/User";
import { buildTenantScopedQuery } from "@/lib/organizationScope";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const organizationId = session!.user.organizationId;

  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  const scopedCampaignQuery = buildTenantScopedQuery(
    { _id: id },
    organizationId,
    { createdBy: { $in: adminIds.map((admin) => admin._id) } }
  );
  const existingCampaign = await Campaign.findOne(scopedCampaignQuery);
  if (!existingCampaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["draft", "scheduled"].includes(existingCampaign.status)) {
    return NextResponse.json({ error: "This campaign has already been sent or is no longer sendable." }, { status: 409 });
  }

  const campaign = await Campaign.findOneAndUpdate(
    {
      ...scopedCampaignQuery,
      status: { $in: ["draft", "scheduled"] },
    },
    { $set: { status: "running", sentAt: new Date() } },
    { new: true }
  );
  if (!campaign) {
    return NextResponse.json({ error: "This campaign is already being sent by another request." }, { status: 409 });
  }

  const template = await Template.findOne(
    buildTenantScopedQuery({ _id: campaign.templateId }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  );
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const targets = await CampaignTarget.find(
    buildTenantScopedQuery({ campaignId: id, emailSentAt: null }, organizationId, { campaignId: id, emailSentAt: null })
  ).populate("userId", "name email");
  if (targets.length === 0) {
    return NextResponse.json({ error: "This campaign has already been sent." }, { status: 409 });
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let simulatedCount = 0;
  let realCount = 0;

  for (const target of targets) {
    const user = target.userId as unknown as { name: string; email: string };
    if (!user?.email) continue;

    if (!target.organizationId && campaign.organizationId) {
      target.organizationId = campaign.organizationId;
    }

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

  return NextResponse.json({
    success: true,
    sent: targets.length,
    simulatedCount,
    realCount,
  });
}
