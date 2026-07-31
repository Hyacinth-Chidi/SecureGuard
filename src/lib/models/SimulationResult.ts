import mongoose, { Schema, models, model } from "mongoose";

export interface ISimulationResult {
  _id: mongoose.Types.ObjectId;
  simulationId: mongoose.Types.ObjectId;
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

const SimulationResultSchema = new Schema<ISimulationResult>(
  {
    simulationId: { type: Schema.Types.ObjectId, ref: "Simulation", required: true },
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

SimulationResultSchema.index({ simulationId: 1, userId: 1 }, { unique: true });

export default models.SimulationResult || model<ISimulationResult>("SimulationResult", SimulationResultSchema);
