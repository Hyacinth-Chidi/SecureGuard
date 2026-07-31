"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Send,
  FileText,
  GraduationCap,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions";

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/campaigns", label: "Campaigns", icon: Send },
  { href: "/dashboard/admin/templates", label: "Templates", icon: FileText },
  { href: "/dashboard/admin/training", label: "Training", icon: GraduationCap },
  { href: "/dashboard/admin/employees", label: "Employees", icon: Users },
  { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart3 },
];

const employeeLinks = [
  { href: "/dashboard/employee", label: "My Overview", icon: LayoutDashboard },
  { href: "/dashboard/employee/training", label: "My Training", icon: GraduationCap },
];

type SidebarRole = "platform_admin" | "org_admin" | "employee";

export function Sidebar({ role, name, department }: { role: SidebarRole; name: string; department: string }) {
  const pathname = usePathname();
  const isAdminRole = role !== "employee";
  const links = isAdminRole ? adminLinks : employeeLinks;
  const roleHome = isAdminRole ? "/dashboard/admin" : "/dashboard/employee";

  return (
    <aside className="w-64 shrink-0 bg-[#050810] text-text-muted flex flex-col h-screen sticky top-0 border-r border-border">
      <div className="flex items-center gap-3 px-6 py-8">
        <Image src="/assets/logo.png" alt="SecureGuard Logo" width={32} height={32} className="rounded-lg shadow-sm shadow-primary-glow/20" />
        <div>
          <p className="font-display font-bold text-lg leading-none text-white tracking-tight">SecureGuard</p>
          <p className="text-[10px] text-primary-glow uppercase tracking-widest mt-1.5 font-bold">Awareness Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== roleHome && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                active ? "bg-primary/15 text-primary-glow shadow-md shadow-primary-glow/10 border border-primary/20" : "text-text-muted hover:bg-surface hover:text-white"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-border/50 bg-[#03050a]">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-glow/20 text-primary-glow border border-primary-glow/30 flex items-center justify-center text-sm font-bold font-mono-data shadow-inner">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{name}</p>
            <p className="text-xs text-text-muted truncate">{department}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-danger transition-colors border border-transparent hover:border-border/50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
