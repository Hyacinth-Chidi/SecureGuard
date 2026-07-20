import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const session = await auth();
  if (session?.user.role === "admin") redirect("/dashboard/admin");
  redirect("/dashboard/employee");
}
