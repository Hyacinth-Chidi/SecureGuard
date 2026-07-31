import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SimulationResult from "@/lib/models/SimulationResult";
import Simulation from "@/lib/models/Simulation";
import Template from "@/lib/models/Template";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectDB();

  const result = await SimulationResult.findOne({ token }).lean();
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const simulation = await Simulation.findById(result.simulationId).lean();
  if (!simulation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = await Template.findById(simulation.templateId).lean();
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    alreadySubmitted: Boolean(result.submittedAt),
    alreadyReported: Boolean(result.reportedAt),
    simulationName: simulation.name,
    template: {
      fromName: template.fromName,
      subject: template.subject,
      landingType: template.landingType ?? "generic",
      landingHeadline: template.landingHeadline,
      landingBody: template.landingBody,
      redFlags: template.redFlags,
    },
  });
}
