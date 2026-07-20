import mongoose, { Schema, models, model } from "mongoose";

export type CampaignStatus = "draft" | "scheduled" | "running" | "completed";

export interface ICampaign {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  templateId: mongoose.Types.ObjectId;
  status: CampaignStatus;
  targetDepartments: string[];
  targetUserIds: mongoose.Types.ObjectId[];
  scheduledAt?: Date;
  sentAt?: Date;
  completedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },
    status: { type: String, enum: ["draft", "scheduled", "running", "completed"], default: "draft" },
    targetDepartments: { type: [String], default: [] },
    targetUserIds: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default models.Campaign || model<ICampaign>("Campaign", CampaignSchema);
