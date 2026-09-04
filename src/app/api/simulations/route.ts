import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/apiAuth";
import Simulation from "@/lib/models/Simulation";
import SimulationResult from "@/lib/models/SimulationResult";
import Template from "@/lib/models/Template";
import User from "@/lib/models/User";
import { generateTrackingToken } from "@/lib/utils";
import { sendSimulationEmail } from "@/lib/mailer";
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

    // Determine target users (any student or employee, excluding admins)
    const query: any = { role: { $in: ["student", "employee"] } };
    const departments = [];
    if (targetDepartment && targetDepartment !== "All") {
      // Case-insensitive department match so "Finance" matches "finance", etc.
      query.department = { $regex: new RegExp(`^${targetDepartment}$`, "i") };
      departments.push(targetDepartment);
    } else {
      departments.push("All");
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    const targetUsers = await User.find(query).select("_id email name");
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create tracking results for each target and send simulation emails
    const resultsToInsert = targetUsers.map((u) => {
      const token = generateTrackingToken();
      const trackingLink = `${appUrl}/phish/${token}`;
      let htmlBody = (template.htmlBody || "")
        .replace(/{{tracking_link}}/g, trackingLink)
        .replace(/{{first_name}}/g, u.name ? u.name.split(" ")[0] : "Team Member");

      sendSimulationEmail({
        to: u.email,
        fromName: template.fromName,
        fromEmail: template.fromEmail,
        subject: template.subject,
        html: htmlBody,
      }).catch((e) => console.error(`Failed to dispatch simulation email to ${u.email}:`, e));

      return {
        simulationId: simulation._id,
        userId: u._id,
        token,
        emailSentAt: new Date(),
      };
    });

    await SimulationResult.insertMany(resultsToInsert);

    return NextResponse.json({ success: true, simulation });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create simulation." }, { status: 500 });
  }
}
