import { connectDB } from "@/lib/db";
import CampaignTarget from "@/lib/models/CampaignTarget";

const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7",
  "base64"
);

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    await connectDB();
    await CampaignTarget.updateOne({ token, openedAt: null }, { $set: { openedAt: new Date() } });
  } catch (err) {
    console.error("Tracking pixel error:", err);
  }

  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
