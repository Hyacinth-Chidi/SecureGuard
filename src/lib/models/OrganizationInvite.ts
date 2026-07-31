import mongoose, { Schema, models, model } from "mongoose";

export interface IOrganizationInvite {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  department: string;
  jobTitle?: string;
  tokenHash: string;
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationInviteSchema = new Schema<IOrganizationInvite>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    department: { type: String, required: true, default: "General", trim: true },
    jobTitle: { type: String, trim: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    acceptedAt: { type: Date },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

OrganizationInviteSchema.index({ organizationId: 1, email: 1, acceptedAt: 1 });

export default models.OrganizationInvite || model<IOrganizationInvite>("OrganizationInvite", OrganizationInviteSchema);
