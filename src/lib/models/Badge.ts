import mongoose, { Schema, models, model } from "mongoose";

export type BadgeType = "first_course" | "all_courses" | "first_report" | "phish_survivor" | "perfect_score";

export interface IBadge {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  badgeType: BadgeType;
  earnedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badgeType: {
      type: String,
      enum: ["first_course", "all_courses", "first_report", "phish_survivor", "perfect_score"],
      required: true,
    },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BadgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

export default models.Badge || model<IBadge>("Badge", BadgeSchema);
