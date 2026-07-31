import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import User from "@/lib/models/User";
import Template from "@/lib/models/Template";
import Simulation from "@/lib/models/Simulation";
import SimulationResult from "@/lib/models/SimulationResult";
import Badge from "@/lib/models/Badge";
import { requireUser } from "@/lib/apiAuth";
import { sendSimulationEmail } from "@/lib/mailer";

const submitSchema = z.object({
  answers: z.array(z.number().int().min(0)),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  await connectDB();
  const adminIds = await User.find({ role: "admin" }, "_id");
  const module_ = await TrainingModule.findOne({ _id: id, createdBy: { $in: adminIds.map((admin) => admin._id) } });
  if (!module_) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session!.user.role === "student" && !module_.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { answers } = parsed.data;
  let correct = 0;
  module_.quiz.forEach((q: { correctIndex: number }, i: number) => {
    if (answers[i] === q.correctIndex) correct++;
  });
  const score = module_.quiz.length > 0 ? Math.round((correct / module_.quiz.length) * 100) : 100;

  const progress = await TrainingProgress.findOne({ userId: session!.user.id, moduleId: id });
  const isFirstCompletion = !progress || progress.status !== "completed";

  const updatedProgress = await TrainingProgress.findOneAndUpdate(
    { userId: session!.user.id, moduleId: id },
    {
      status: "completed",
      score,
      completedAt: new Date(),
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true }
  );

  // Automated Post-Course Phishing Flow
  if (isFirstCompletion && module_.simulationTemplateId) {
    const template = await Template.findById(module_.simulationTemplateId);
    if (template) {
      let simulation = await Simulation.findOne({
        name: `Automated: ${module_.title}`,
        templateId: template._id,
      });

      if (!simulation) {
        simulation = await Simulation.create({
          name: `Automated: ${module_.title}`,
          description: `Automated phishing simulation triggered after completing: ${module_.title}`,
          templateId: template._id,
          status: "running",
          createdBy: module_.createdBy,
          sentAt: new Date(),
        });
      } else if (simulation.status !== "running") {
        simulation.status = "running";
        await simulation.save();
      }

      const existingResult = await SimulationResult.findOne({
        simulationId: simulation._id,
        userId: session!.user.id,
      });

      if (!existingResult) {
        const token = crypto.randomBytes(24).toString("hex");
        await SimulationResult.create({
          simulationId: simulation._id,
          userId: session!.user.id,
          token,
          emailSentAt: new Date(),
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const trackingLink = `${appUrl}/phish/${token}`;
        
        let htmlBody = template.htmlBody.replace(/{{tracking_link}}/g, trackingLink);
        const firstName = session!.user.name ? session!.user.name.split(" ")[0] : "Student";
        htmlBody = htmlBody.replace(/{{first_name}}/g, firstName);

        await sendSimulationEmail({
          to: session!.user.email as string,
          fromName: template.fromName,
          fromEmail: template.fromEmail,
          subject: template.subject,
          html: htmlBody,
        });
      }
    }
  }

  // Award badges
  const earnedBadges: string[] = [];
  const userId = session!.user.id;

  // 1. first_course
  const completedCount = await TrainingProgress.countDocuments({ userId, status: "completed" });
  if (completedCount >= 1) {
    try {
      await Badge.create({ userId, badgeType: "first_course" });
      earnedBadges.push("first_course");
    } catch {
      // Badge already exists (unique index constraint)
    }
  }

  // 2. perfect_score
  if (score === 100) {
    try {
      await Badge.create({ userId, badgeType: "perfect_score" });
      earnedBadges.push("perfect_score");
    } catch {
      // Badge already exists
    }
  }

  // 3. all_courses
  const totalPublished = await TrainingModule.countDocuments({
    published: true,
    createdBy: { $in: adminIds.map((admin) => admin._id) },
  });
  if (completedCount >= totalPublished && totalPublished > 0) {
    try {
      await Badge.create({ userId, badgeType: "all_courses" });
      earnedBadges.push("all_courses");
    } catch {
      // Badge already exists
    }
  }

  return NextResponse.json({
    progress: updatedProgress,
    score,
    correct,
    total: module_.quiz.length,
    earnedBadges,
  });
}
