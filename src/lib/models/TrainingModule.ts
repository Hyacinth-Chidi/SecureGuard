import mongoose, { Schema, models, model } from "mongoose";

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ITrainingModule {
  _id: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  content: string;
  category: string;
  estimatedMinutes: number;
  quiz: IQuizQuestion[];
  published: boolean;
  simulationTemplateId?: mongoose.Types.ObjectId;
  prerequisiteModuleId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { _id: false }
);

const TrainingModuleSchema = new Schema<ITrainingModule>(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    content: { type: String, required: true },
    category: { type: String, default: "General" },
    estimatedMinutes: { type: Number, default: 5 },
    quiz: { type: [QuizQuestionSchema], default: [] },
    published: { type: Boolean, default: true },
    simulationTemplateId: { type: Schema.Types.ObjectId, ref: "Template" },
    prerequisiteModuleId: { type: Schema.Types.ObjectId, ref: "TrainingModule" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.TrainingModule || model<ITrainingModule>("TrainingModule", TrainingModuleSchema);
