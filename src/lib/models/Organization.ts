import mongoose, { Schema, model, models } from "mongoose";

export interface IOrganizationBranding {
  logoUrl?: string;
  primaryColor?: string;
}

export interface IOrganization {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  primaryDomain?: string;
  industry?: string;
  branding?: IOrganizationBranding;
  allowedEmailDomains: string[];
  onboardingPolicy: "invite_only" | "disabled";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationBrandingSchema = new Schema<IOrganizationBranding>(
  {
    logoUrl: { type: String },
    primaryColor: { type: String },
  },
  { _id: false }
);

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    primaryDomain: { type: String, lowercase: true, trim: true },
    industry: { type: String, trim: true },
    branding: { type: OrganizationBrandingSchema, default: {} },
    allowedEmailDomains: { type: [String], default: [] },
    onboardingPolicy: { type: String, enum: ["invite_only", "disabled"], default: "disabled" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Organization || model<IOrganization>("Organization", OrganizationSchema);
