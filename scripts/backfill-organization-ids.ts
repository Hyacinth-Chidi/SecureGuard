import "dotenv/config";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import CampaignTarget from "@/lib/models/CampaignTarget";
import Template from "@/lib/models/Template";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import User from "@/lib/models/User";
import { ensureLegacyOrganization } from "@/lib/tenant";

async function main() {
  await connectDB();
  const legacyOrganization = await ensureLegacyOrganization();

  const userResult = await User.updateMany(
    {
      role: { $ne: "platform_admin" },
      $or: [{ organizationId: { $exists: false } }, { organizationId: null }],
    },
    { $set: { organizationId: legacyOrganization._id } }
  );

  const users = await User.find({}, "_id organizationId").lean();
  const userOrgById = new Map(users.map((user) => [user._id.toString(), user.organizationId ?? legacyOrganization._id]));

  let templatesUpdated = 0;
  for (const template of await Template.find({
    $or: [{ organizationId: { $exists: false } }, { organizationId: null }],
  })) {
    template.organizationId = template.createdBy ? userOrgById.get(template.createdBy.toString()) : legacyOrganization._id;
    await template.save();
    templatesUpdated++;
  }

  let modulesUpdated = 0;
  for (const module_ of await TrainingModule.find({
    $or: [{ organizationId: { $exists: false } }, { organizationId: null }],
  })) {
    module_.organizationId = module_.createdBy ? userOrgById.get(module_.createdBy.toString()) : legacyOrganization._id;
    await module_.save();
    modulesUpdated++;
  }

  let campaignsUpdated = 0;
  for (const campaign of await Campaign.find({
    $or: [{ organizationId: { $exists: false } }, { organizationId: null }],
  })) {
    campaign.organizationId = userOrgById.get(campaign.createdBy.toString()) ?? legacyOrganization._id;
    await campaign.save();
    campaignsUpdated++;
  }

  const campaigns = await Campaign.find({}, "_id organizationId").lean();
  const campaignOrgById = new Map(campaigns.map((campaign) => [campaign._id.toString(), campaign.organizationId ?? legacyOrganization._id]));

  const modules = await TrainingModule.find({}, "_id organizationId").lean();
  const moduleOrgById = new Map(modules.map((module_) => [module_._id.toString(), module_.organizationId ?? legacyOrganization._id]));

  let targetsUpdated = 0;
  for (const target of await CampaignTarget.find({
    $or: [{ organizationId: { $exists: false } }, { organizationId: null }],
  })) {
    target.organizationId =
      campaignOrgById.get(target.campaignId.toString()) ?? userOrgById.get(target.userId.toString()) ?? legacyOrganization._id;
    await target.save();
    targetsUpdated++;
  }

  let progressUpdated = 0;
  for (const progress of await TrainingProgress.find({
    $or: [{ organizationId: { $exists: false } }, { organizationId: null }],
  })) {
    progress.organizationId =
      moduleOrgById.get(progress.moduleId.toString()) ?? userOrgById.get(progress.userId.toString()) ?? legacyOrganization._id;
    await progress.save();
    progressUpdated++;
  }

  console.log("Organization backfill complete", {
    legacyOrganization: legacyOrganization.slug,
    usersMatched: userResult.matchedCount,
    usersModified: userResult.modifiedCount,
    templatesUpdated,
    modulesUpdated,
    campaignsUpdated,
    targetsUpdated,
    progressUpdated,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.connection.close();
  });
