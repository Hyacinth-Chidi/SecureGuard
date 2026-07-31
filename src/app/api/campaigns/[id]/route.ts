import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import CampaignTarget from "@/lib/models/CampaignTarget";
import { requireAdmin } from "@/lib/apiAuth";
import User from "@/lib/models/User";
import { buildTenantScopedQuery } from "@/lib/organizationScope";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  const campaign = await Campaign.findOne(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  )
    .populate("templateId")
    .lean();
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targets = await CampaignTarget.find(
    buildTenantScopedQuery({ campaignId: id }, organizationId, { campaignId: id })
  )
    .populate("userId", "name email department")
    .lean();

  return NextResponse.json({ campaign, targets });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  await Campaign.findOneAndDelete(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  );
  await CampaignTarget.deleteMany(buildTenantScopedQuery({ campaignId: id }, organizationId, { campaignId: id }));
  return NextResponse.json({ success: true });
}
