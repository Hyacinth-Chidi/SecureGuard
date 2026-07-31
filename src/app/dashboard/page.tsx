import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const redirectPath = session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/student";
  redirect(redirectPath);
}
