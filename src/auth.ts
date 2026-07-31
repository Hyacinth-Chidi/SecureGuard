import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { ensureUserOrganization } from "@/lib/tenant";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        orgSlug: { label: "Organization", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const requestedOrgSlug = (credentials?.orgSlug as string | undefined)?.trim().toLowerCase();
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("organizationId", "name slug active");
        if (!user || !user.active) return null;

        if ((user.role as string) === "admin") {
          user.role = "org_admin";
        }

        const organization = await ensureUserOrganization(user);
        if (user.role !== "platform_admin") {
          if (!organization || !organization.active) return null;
          if (requestedOrgSlug && organization.slug !== requestedOrgSlug) return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          organizationId: organization?._id.toString(),
          organizationSlug: organization?.slug ?? null,
          organizationName: organization?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.organizationSlug = user.organizationSlug;
        token.organizationName = user.organizationName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "platform_admin" | "org_admin" | "employee";
        session.user.department = token.department as string;
        session.user.organizationId = token.organizationId as string | null;
        session.user.organizationSlug = token.organizationSlug as string | null;
        session.user.organizationName = token.organizationName as string | null;
      }
      return session;
    },
  },
});
