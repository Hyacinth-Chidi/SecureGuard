import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "employee";
    department?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "employee";
      department: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "employee";
    department?: string;
  }
}
