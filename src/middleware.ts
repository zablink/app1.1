import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  const isApiRoute = pathname.startsWith("/api");
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt";

  const isBypassRoute = [
    "/login",
    "/underconstruction",
  ].includes(pathname);

  // ✅ UNDERCONSTRUCTION MODE (เฉพาะ production)
  if (process.env.VERCEL_ENV === "production") {
    if (!isApiRoute && !isStaticAsset && !isBypassRoute) {
      url.pathname = "/underconstruction";
      return NextResponse.redirect(url);
    }
  }

  // ✅ LOGIN CHECK
  if (
    !token &&
    !isApiRoute &&
    !isStaticAsset &&
    !["/login", "/complete-profile", "/underconstruction"].includes(pathname)
  ) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ BLOCK enduser เข้า store/admin
  if (token?.role === "enduser" && (pathname.startsWith("/store") || pathname.startsWith("/admin"))) {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // ✅ BLOCK store เข้า admin
  if (token?.role === "store" && pathname.startsWith("/admin")) {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // ✅ BLOCK admin เข้า store
  if (token?.role === "admin" && pathname.startsWith("/store")) {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // ✅ enduser ต้องกรอก complete-profile
  if (
    token?.role === "enduser" &&
    pathname !== "/complete-profile" &&
    pathname !== "/login" &&
    !pathname.startsWith("/api/check-profile")
  ) {
    const checkProfile = await fetch(`${req.nextUrl.origin}/api/check-profile`, {
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (checkProfile.status === 200) {
      const { isComplete } = await checkProfile.json();
      if (!isComplete) {
        url.pathname = "/complete-profile";
        return NextResponse.redirect(url);
      }
    } else {
      url.pathname = "/complete-profile";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
