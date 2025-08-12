// /src/middleware.ts
// หรือย้ายไป /middleware.ts ถ้าโปรเจกต์คุณไม่ได้ใช้ src folder

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  // Paths ที่ถือว่าเป็น Public (เข้าถึงได้โดยไม่ต้อง Login)
  const publicRoutes = [
    "/", // หน้าแรก
    "/login",
    "/signup", // ควรเพิ่มหน้านี้ด้วยหากมีการสมัคร
    "/complete-profile", // หน้ากรอกโปรไฟล์เพิ่มเติม
    "/auth/error", // หน้าแสดงข้อผิดพลาดของ NextAuth.js
    // เพิ่มหน้าอื่นๆ ที่ต้องการให้เป็น Public ที่นี่
  ];

  // ตรวจสอบว่าเป็น Static Asset หรือ API Route หรือไม่
  const isExcludedPath =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
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

  // **ส่วนนี้คือ Logic ที่จะบังคับ Login (ปัจจุบันถูกคอมเมนต์อยู่ตามที่คุณต้องการ)**
  // หากคุณต้องการบังคับให้ Login ในอนาคตสำหรับหน้าที่ไม่ใช่ public:
  /*
  if (!token && !isExcludedPath && !publicRoutes.includes(pathname)) {
    console.log(`REDIRECT: No token, redirecting ${pathname} to /login`);
    return NextResponse.redirect(new URL("/login", req.url));
  }
  */

  // ✅ BLOCK user เข้า store/admin
  if (token?.role === "user" && (pathname.startsWith("/store") || pathname.startsWith("/admin"))) {
    console.log(`BLOCK: User role tried to access ${pathname}`);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ BLOCK store เข้า admin
  if (token?.role === "shop" && pathname.startsWith("/admin")) {
    console.log(`BLOCK: Shop role tried to access ${pathname}`);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ BLOCK admin เข้า store
  if (token?.role === "admin" && pathname.startsWith("/store")) {
    console.log(`BLOCK: Admin role tried to access ${pathname}`);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ user ต้องกรอก complete-profile ก่อน
  /* อันนี้เป็น Logic ที่คุณคอมเมนต์ไว้เช่นกัน
  // โปรดระวัง: การใช้ fetch ใน middleware อาจมี overhead
  // พิจารณาการเก็บสถานะ isComplete ไว้ใน JWT หากเป็นไปได้เพื่อลดการ fetch DB
  if (
    token?.role === "user" &&
    !publicRoutes.includes(pathname) && // ไม่ต้องเช็คซ้ำ login / ก็ใช้ publicRoutes
    pathname !== "/complete-profile" &&
    !pathname.startsWith("/api/check-profile") // ไม่ต้องเช็ค api/check-profile ซ้ำ เพราะเป็น API
  ) {
    try {
      const checkProfile = await fetch(`${req.nextUrl.origin}/api/check-profile`, {
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
      });

      if (checkProfile.ok) { // ใช้ checkProfile.ok แทน status === 200
        const { isComplete } = await checkProfile.json();
        console.log("Check profile returned isComplete =", isComplete);
        if (!isComplete) {
          console.log("Redirecting to /complete-profile because profile is incomplete.");
          return NextResponse.redirect(new URL("/complete-profile", req.url));
        }
      } else {
        console.error("Check profile API call failed with status:", checkProfile.status);
        // อาจจะต้อง redirect ไปยังหน้า error หรือ complete-profile
        return NextResponse.redirect(new URL("/complete-profile", req.url));
      }
    } catch (e) {
      console.error("Error calling check-profile API in middleware:", e);
      return NextResponse.redirect(new URL("/complete-profile", req.url)); // Handle network/other errors
    }
  }
  */

  const res = NextResponse.next();
  // ตั้งค่า Cache-Control สำหรับ API Routes หรือหน้าที่มีการเปลี่ยนแปลงบ่อย
  // การตั้งค่านี้อาจไม่จำเป็นสำหรับทุกหน้า และอาจส่งผลต่อประสิทธิภาพ cache
  // res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  // `matcher` กำหนดว่า Middleware นี้จะถูกรันกับ Path ไหนบ้าง
  // `.` ใน regex match ได้ทุกตัวยกเว้น newline
  // `*` หมายถึง 0 หรือมากกว่าของตัวก่อนหน้า
  // `?` หมายถึง 0 หรือ 1 ของตัวก่อนหน้า
  // `+` หมายถึง 1 หรือมากกว่าของตัวก่อนหน้า
  // `((?!...).*)` คือ Negative Lookahead: match ทุกอย่างที่ไม่ได้อยู่หลัง ?!
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /robots.txt (robots.txt file)
     */
    // ผมแนะนำให้รวม Asset Path ส่วนใหญ่ไว้ใน isExcludedPath และให้ matcher รันทุกหน้า
    // แล้วใช้ logic ใน middleware function เพื่อตัดสินใจ redirect/block
    // ถ้า matcher แคบไป อาจทำให้ logic ใน middleware ไม่ถูกรัน
    // ถ้าคุณต้องการให้ Middleware รันเกือบทุก Request:
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
    // หรือถ้าอยากให้แคบลงและไม่รันกับ API routes:
    // "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};