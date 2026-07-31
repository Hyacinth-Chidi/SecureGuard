import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getOrganizationHomePath, getPostLoginRedirect } from "@/lib/tenant";

// Next.js 16 renamed middleware.ts -> proxy.ts to make clear this is a thin
// routing/network boundary, not a place for business logic. The redirects
// below are a fast, convenience layer only. Real authorization is enforced
// again in src/app/dashboard/layout.tsx (and in every API route via
// requireAdmin/requireUser) so access control does not depend on this file
// alone — matching Next.js's current guidance not to trust proxy-only auth.
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const organizationSlug = req.auth?.user?.organizationSlug;

  const orgLoginMatch = pathname.match(/^\/([^/]+)\/login$/);
  const orgJoinMatch = pathname.match(/^\/([^/]+)\/join$/);
  const orgRootMatch = pathname.match(/^\/([^/]+)(?:\/.*)?$/);
  const orgAdminAreaMatch = pathname.match(/^\/([^/]+)\/admin(?:\/|$)/);
  const orgEmployeeAreaMatch = pathname.match(/^\/([^/]+)\/employee(?:\/|$)/);

  const reservedTopLevel = new Set([
    "dashboard", "platform", "login", "register", "signup", "phish", 
    "_next", "api", "assets", "favicon.ico"
  ]);
  const orgSlugInPath =
    orgRootMatch && !reservedTopLevel.has(orgRootMatch[1]) ? orgRootMatch[1] : null;

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/signup" || !!orgLoginMatch || !!orgJoinMatch;
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminArea = pathname.startsWith("/dashboard/admin");
  const isEmployeeArea = pathname.startsWith("/dashboard/employee");
  const isPlatformAdminArea = pathname.startsWith("/platform/admin");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(getPostLoginRedirect(role, organizationSlug), nextUrl));
    }
    return NextResponse.next();
  }

  if ((isDashboard || isPlatformAdminArea) && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPlatformAdminArea && role !== "platform_admin") {
    return NextResponse.redirect(new URL(getPostLoginRedirect(role, organizationSlug), nextUrl));
  }

  if (isAdminArea && role !== "org_admin") {
    return NextResponse.redirect(new URL(getOrganizationHomePath("employee", organizationSlug), nextUrl));
  }

  if (isEmployeeArea && role === "org_admin") {
    return NextResponse.redirect(new URL(getOrganizationHomePath("org_admin", organizationSlug), nextUrl));
  }

  if (orgSlugInPath) {
    if (!isLoggedIn) {
      const loginUrl = new URL(`/${orgSlugInPath}/login`, nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role === "platform_admin") {
      return NextResponse.redirect(new URL("/platform/admin/dashboard", nextUrl));
    }

    if (organizationSlug && orgSlugInPath !== organizationSlug) {
      return NextResponse.redirect(new URL(getPostLoginRedirect(role, organizationSlug), nextUrl));
    }

    if (orgAdminAreaMatch && role !== "org_admin") {
      return NextResponse.redirect(new URL(`/${organizationSlug}/employee/dashboard`, nextUrl));
    }

    if (orgEmployeeAreaMatch && role === "org_admin") {
      return NextResponse.redirect(new URL(`/${organizationSlug}/admin/dashboard`, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/platform/:path*", "/:org", "/:org/:path*"],
};
