import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import User from "@/lib/models/User";
import CampaignTarget from "@/lib/models/CampaignTarget";
import { requireAdmin } from "@/lib/apiAuth";
import Template from "@/lib/models/Template";
import { buildTenantScopedQuery } from "@/lib/organizationScope";
import { generateTrackingToken } from "@/lib/utils";

const campaignSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  templateId: z.string().min(1),
  targetDepartments: z.array(z.string()).default([]),
  targetUserIds: z.array(z.string()).default([]),
});

export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  const campaigns = await Campaign.find(
    buildTenantScopedQuery({}, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  )
    .sort({ createdAt: -1 })
    .populate("templateId", "name category")
    .lean();

  const campaignIds = campaigns.map((c) => c._id);
  const targets = await CampaignTarget.aggregate([
    { $match: { campaignId: { $in: campaignIds } } },
    {
      $group: {
        _id: "$campaignId",
        total: { $sum: 1 },
        opened: { $sum: { $cond: [{ $ne: ["$openedAt", null] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $ne: ["$clickedAt", null] }, 1, 0] } },
        submitted: { $sum: { $cond: [{ $ne: ["$submittedAt", null] }, 1, 0] } },
        reported: { $sum: { $cond: [{ $ne: ["$reportedAt", null] }, 1, 0] } },
      },
    },
  ]);
  const statsByCampaign = new Map(targets.map((t) => [t._id.toString(), t]));

  const enriched = campaigns.map((c) => ({
    ...c,
    stats: statsByCampaign.get(c._id.toString()) ?? { total: 0, opened: 0, clicked: 0, submitted: 0, reported: 0 },
  }));

  return NextResponse.json({ campaigns: enriched });
}

export async function POST(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");

  const { targetDepartments, targetUserIds, ...rest } = parsed.data;
  const targetingProvided = targetDepartments.length > 0 || targetUserIds.length > 0;

  const template = await Template.findOne(
    buildTenantScopedQuery({ _id: rest.templateId }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  ).select("_id");
  if (!template) {
    return NextResponse.json({ error: "Template not found in this organization." }, { status: 404 });
  }

  let resolvedUserIds = new Set(targetUserIds);
  if (targetDepartments.length > 0) {
    const deptUsers = await User.find(
      {
        department: { $in: targetDepartments },
        role: "employee",
        active: true,
        organizationId,
      },
      "_id"
    );
    deptUsers.forEach((u) => resolvedUserIds.add(u._id.toString()));
  }

  if (resolvedUserIds.size === 0 && targetingProvided) {
    return NextResponse.json(
      { error: "The selected targeting did not match any active employees in this organization." },
      { status: 400 }
    );
  }

  if (resolvedUserIds.size === 0) {
    const allEmployees = await User.find({ role: "employee", active: true, organizationId }, "_id");
    allEmployees.forEach((u) => resolvedUserIds.add(u._id.toString()));
  }

  if (resolvedUserIds.size === 0) {
    return NextResponse.json({ error: "There are no active employees available to target." }, { status: 400 });
  }

  const campaign = await Campaign.create({
    ...rest,
    organizationId,
    targetDepartments,
    targetUserIds: Array.from(resolvedUserIds),
    createdBy: session!.user.id,
  });

  const targetDocs = Array.from(resolvedUserIds).map((userId) => ({
    organizationId,
    campaignId: campaign._id,
    userId,
    token: generateTrackingToken(),
  }));
  if (targetDocs.length > 0) {
    await CampaignTarget.insertMany(targetDocs);
  }

  return NextResponse.json({ campaign }, { status: 201 });
}
