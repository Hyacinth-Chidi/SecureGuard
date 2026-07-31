import mongoose, { Schema, models, model } from "mongoose";

export type TrainingStatus = "not_started" | "in_progress" | "completed";

export interface ITrainingProgress {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  status: TrainingStatus;
  score?: number;
  attempts: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingProgressSchema = new Schema<ITrainingProgress>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "TrainingModule", required: true },
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
    score: { type: Number },
    attempts: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

TrainingProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export default models.TrainingProgress || model<ITrainingProgress>("TrainingProgress", TrainingProgressSchema);
