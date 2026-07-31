import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "platform_admin" | "org_admin" | "employee";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  organizationId?: mongoose.Types.ObjectId;
  department: string;
  jobTitle?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["platform_admin", "org_admin", "employee"], default: "employee" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    department: { type: String, default: "General" },
    jobTitle: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
