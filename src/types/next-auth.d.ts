import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "platform_admin" | "org_admin" | "employee";
    organizationId?: string | null;
    organizationSlug?: string | null;
    organizationName?: string | null;
    department?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "platform_admin" | "org_admin" | "employee";
      organizationId?: string | null;
      organizationSlug?: string | null;
      organizationName?: string | null;
      department: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "platform_admin" | "org_admin" | "employee";
    organizationId?: string | null;
    organizationSlug?: string | null;
    organizationName?: string | null;
    department?: string;
  }
}
