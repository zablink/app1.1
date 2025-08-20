// /src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-based access
const roleRestrictions: Record<string, string[]> = {
  user: ["/shop", "/admin"],
  shop: ["/admin"],
  admin: [], // admin เข้าได้ทุกที่
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/complete-profile",
    "/auth/error",
    "/auth/signin",
    "/auth/welcome",
    "/auth/verify",
  ];

  const isExcludedPath =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    [".png", ".jpg", ".jpeg", ".gif", ".svg", ".css", ".js", ".map", ".woff", ".woff2", ".ttf", ".otf", ".json"].some(ext => pathname.endsWith(ext)) ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt";

  if (publicRoutes.includes(pathname) || isExcludedPath) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const role = token.role as string | undefined;
  if (role && roleRestrictions[role]) {
    const restrictedPaths = roleRestrictions[role];
    if (restrictedPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
