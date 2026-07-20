import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Next.js 16 renamed middleware.ts -> proxy.ts to make clear this is a thin
// routing/network boundary, not a place for business logic. The redirects
// below are a fast, convenience layer only. Real authorization is enforced
// again in src/app/dashboard/layout.tsx (and in every API route via
// requireAdmin/requireUser) so access control does not depend on this file
// alone — matching Next.js's current guidance not to trust proxy-only auth.
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isAdminArea = nextUrl.pathname.startsWith("/dashboard/admin");
  const isEmployeeArea = nextUrl.pathname.startsWith("/dashboard/employee");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/employee", nextUrl));
  }

  if (isEmployeeArea && role === "admin") {
    return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
