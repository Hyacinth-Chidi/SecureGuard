import mongoose, { Schema, models, model } from "mongoose";

export type TemplateDifficulty = "easy" | "medium" | "hard";
export type LandingType = "generic" | "microsoft" | "portal" | "hr" | "invoice" | "social";

export interface ITemplate {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  isSystem: boolean;
  name: string;
  category: string;
  difficulty: TemplateDifficulty;
  fromName: string;
  fromEmail: string;
  subject: string;
  htmlBody: string;
  landingType: LandingType;
  landingHeadline: string;
  landingBody: string;
  redFlags: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    isSystem: { type: Boolean, default: false, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "General" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    subject: { type: String, required: true },
    htmlBody: { type: String, required: true },
    landingType: { type: String, enum: ["generic", "microsoft", "portal", "hr", "invoice", "social"], default: "generic" },
    landingHeadline: { type: String, default: "You just fell for a simulated phishing test" },
    landingBody: { type: String, default: "" },
    redFlags: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.Template || model<ITemplate>("Template", TemplateSchema);
