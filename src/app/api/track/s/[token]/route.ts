import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SimulationResult from "@/lib/models/SimulationResult";
import Simulation from "@/lib/models/Simulation";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import Notification from "@/lib/models/Notification";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  await connectDB();
  const target = await SimulationResult.findOneAndUpdate(
    { token, submittedAt: null },
    { $set: { submittedAt: new Date() } },
    { new: true }
  );

  if (!target) {
    return NextResponse.json({ error: "Invalid or already recorded" }, { status: 404 });
  }

  // Trigger Remediation Workflow
  try {
    const simulation = await Simulation.findById(target.simulationId);
    if (simulation) {
      const module_ = await TrainingModule.findOne({ simulationTemplateId: simulation.templateId });
      if (module_) {
        // Reset progress status so student retakes training
        await TrainingProgress.findOneAndUpdate(
          { userId: target.userId, moduleId: module_._id },
          { status: "in_progress" }
        );

        // Send notification
        await Notification.create({
          userId: target.userId,
          type: "remediation",
          title: `Remediation Needed: ${module_.title}`,
          message: `You entered information on a simulated phishing email. Please review this course again to stay sharp.`,
          link: `/dashboard/student/training/${module_._id}`,
        });
      }
    }
  } catch (err) {
    console.error("Error triggering remediation:", err);
  }

  return NextResponse.json({ success: true });
}
