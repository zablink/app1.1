import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // ✅ แสดง underconstruction บน production เท่านั้น
  if (process.env.VERCEL_ENV === "production") {
  console.log("🛠 Production mode detected");
  const isBypass = pathname.startsWith("/api") || pathname === "/underconstruction";
  if (!isBypass) {
    url.pathname = "/underconstruction";
    return NextResponse.redirect(url);
  }
}


  // ❌ ไม่ login → redirect ไป /login
  if (!token && (pathname.startsWith("/store") || pathname.startsWith("/admin") || pathname !== "/complete-profile")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ❌ enduser พยายามเข้า /store หรือ /admin
  if (token?.role === "enduser" && (pathname.startsWith("/store") || pathname.startsWith("/admin"))) {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // ❌ store เข้าหน้า admin
  if (token?.role === "store" && pathname.startsWith("/admin")) {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  // ❌ admin เข้าหน้า store
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
    "/admin/:path*",
    "/store/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
