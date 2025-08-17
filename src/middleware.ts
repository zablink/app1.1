// /src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Public routes ที่ไม่ต้อง login
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/complete-profile",
    "/auth/error",
  ];

  // Skip static files & API
  const isExcludedPath =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".map") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf") ||
    pathname.endsWith(".otf") ||
    pathname.endsWith(".json") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt";

  // ถ้า public หรือ static ก็ปล่อยผ่าน
  if (publicRoutes.includes(pathname) || isExcludedPath) return NextResponse.next();

  // ดึง token จาก JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ถ้าไม่ login ให้ redirect ไป /login
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  // Role-based access control
  if (token.role === "user" && pathname.startsWith("/shop")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (token.role === "shop" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (token.role === "admin" && pathname.startsWith("/shop")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
