import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "student";
    department?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "student";
      department: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "student";
    department?: string;
  }
}
