import mongoose, { Schema, models, model } from "mongoose";

export interface ICampaignTarget {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  emailSentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  submittedAt?: Date;
  reportedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignTargetSchema = new Schema<ICampaignTarget>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    emailSentAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    submittedAt: { type: Date },
    reportedAt: { type: Date },
  },
  { timestamps: true }
);

CampaignTargetSchema.index({ campaignId: 1, userId: 1 }, { unique: true });

export default models.CampaignTarget || model<ICampaignTarget>("CampaignTarget", CampaignTargetSchema);
