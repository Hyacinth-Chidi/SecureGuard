import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CampaignTarget from "@/lib/models/CampaignTarget";
import Campaign from "@/lib/models/Campaign";
import Template from "@/lib/models/Template";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectDB();

  const target = await CampaignTarget.findOne({ token }).lean();
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const campaign = await Campaign.findById(target.campaignId).lean();
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = await Template.findById(campaign.templateId).lean();
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    alreadySubmitted: Boolean(target.submittedAt),
    alreadyReported: Boolean(target.reportedAt),
    campaignName: campaign.name,
    template: {
      fromName: template.fromName,
      subject: template.subject,
      landingType: template.landingType ?? "generic",
      landingHeadline: template.landingHeadline,
      landingBody: template.landingBody,
      redFlags: template.redFlags,
    },
  });
}
