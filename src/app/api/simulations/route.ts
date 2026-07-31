import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/apiAuth";
import Simulation from "@/lib/models/Simulation";
import SimulationResult from "@/lib/models/SimulationResult";
import User from "@/lib/models/User";
import { generateTrackingToken } from "@/lib/utils";
import mongoose from "mongoose";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  // Fetch simulations with basic stats
  const simulations = await Simulation.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "templates",
        localField: "templateId",
        foreignField: "_id",
        as: "template",
      },
    },
    { $unwind: "$template" },
    {
      $lookup: {
        from: "simulationresults",
        localField: "_id",
        foreignField: "simulationId",
        as: "results",
      },
    },
    {
      $project: {
        name: 1,
        status: 1,
        createdAt: 1,
        targetDepartments: 1,
        templateName: "$template.name",
        totalTargets: { $size: "$results" },
        clicked: {
          $size: {
            $filter: {
              input: "$results",
              as: "res",
              cond: { $ne: ["$$res.clickedAt", null] },
            },
          },
        },
        reported: {
          $size: {
            $filter: {
              input: "$results",
              as: "res",
              cond: { $ne: ["$$res.reportedAt", null] },
            },
          },
        },
      },
    },
  ]);

  return NextResponse.json({ simulations });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { name, templateId, targetDepartment } = await req.json();

    if (!name || !templateId) {
      return NextResponse.json({ error: "Name and Template ID are required." }, { status: 400 });
    }

    // Determine target users
    const query: any = { role: "student" };
    const departments = [];
    if (targetDepartment && targetDepartment !== "All") {
      query.department = targetDepartment;
      departments.push(targetDepartment);
    } else {
      departments.push("All");
    }

    const targetUsers = await User.find(query).select("_id");
    if (targetUsers.length === 0) {
      return NextResponse.json({ error: "No users found for the selected department." }, { status: 400 });
    }

    const targetUserIds = targetUsers.map((u) => u._id);

    // Create the Simulation
    const simulation = await Simulation.create({
      name,
      templateId,
      status: "running",
      targetDepartments: departments,
      targetUserIds,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
      sentAt: new Date(),
    });

    // Create tracking results for each target
    const resultsToInsert = targetUserIds.map((userId) => ({
      simulationId: simulation._id,
      userId,
      token: generateTrackingToken(),
      emailSentAt: new Date(),
    }));

    await SimulationResult.insertMany(resultsToInsert);

    return NextResponse.json({ success: true, simulation });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create simulation." }, { status: 500 });
  }
}
