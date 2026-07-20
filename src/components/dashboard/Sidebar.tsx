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

export function Sidebar({ role, name, department }: { role: "admin" | "employee"; name: string; department: string }) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : employeeLinks;

  return (
    <aside className="w-64 shrink-0 bg-ink text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Image src="/assets/logo.png" alt="SecureGuard Logo" width={32} height={32} className="rounded" />
        <div>
          <p className="font-display font-semibold text-lg leading-none">SecureGuard</p>
          <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">Awareness Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== `/dashboard/${role}` && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-teal text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal-bright/20 text-teal-bright flex items-center justify-center text-xs font-semibold font-mono-data">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-white/50 truncate">{department}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
