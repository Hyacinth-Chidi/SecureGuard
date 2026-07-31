import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SimulationResult from "@/lib/models/SimulationResult";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  try {
    await connectDB();
    await SimulationResult.updateOne({ token, openedAt: null }, { $set: { openedAt: new Date() } });
    await SimulationResult.updateOne({ token, clickedAt: null }, { $set: { clickedAt: new Date() } });
  } catch (err) {
    console.error("Click tracking error:", err);
  }

  return NextResponse.redirect(`${baseUrl}/phish/${token}`);
}
