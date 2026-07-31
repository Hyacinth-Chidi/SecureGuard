import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPostLoginRedirect } from "@/lib/tenant";

export default async function DashboardIndex() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  redirect(getPostLoginRedirect(session.user.role, session.user.organizationSlug));
}
