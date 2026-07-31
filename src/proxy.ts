import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/signup";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminArea = pathname.startsWith("/dashboard/admin");
  const isStudentArea = pathname.startsWith("/dashboard/student");

  if (isAuthPage) {
    if (isLoggedIn) {
      const redirectPath = role === "admin" ? "/dashboard/admin" : "/dashboard/student";
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
    return NextResponse.next();
  }

  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/student", nextUrl));
  }

  if (isStudentArea && role === "admin") {
    return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/signup"],
};
