import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar role={session.user.role} name={session.user.name ?? "User"} department={session.user.department} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
