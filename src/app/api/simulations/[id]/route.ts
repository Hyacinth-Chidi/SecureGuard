import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/apiAuth";
import Simulation from "@/lib/models/Simulation";
import SimulationResult from "@/lib/models/SimulationResult";
import User from "@/lib/models/User";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const simulation = await Simulation.findById(id).populate("templateId", "name subject").lean();
    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found." }, { status: 404 });
    }

    const results = await SimulationResult.find({ simulationId: id }).populate("userId", "name email department").lean();

    return NextResponse.json({ simulation, results });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch simulation." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    await Simulation.findByIdAndDelete(id);
    await SimulationResult.deleteMany({ simulationId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete simulation." }, { status: 500 });
  }
}
