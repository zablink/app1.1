// pages/auth/error.tsx

import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function AuthErrorPage() {
  const router = useRouter();
  const { error } = router.query;

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked:
      "บัญชีอีเมลนี้เคยลงทะเบียนไว้แล้ว โปรดเข้าสู่ระบบด้วยวิธีเดิมที่เคยใช้ (เช่น Google หรือ Facebook)",
    AccessDenied:
      "คุณไม่ได้รับสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ",
    Configuration:
      "การตั้งค่าระบบยังไม่ถูกต้อง กรุณาติดต่อผู้ดูแล",
    Verification:
      "ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่",
    default:
      "เกิดข้อผิดพลาดบางอย่างในการเข้าสู่ระบบ กรุณาลองใหม่ภายหลัง",
  };

  const errorCode = typeof error === "string" ? error : "default";
  const errorMessage = errorMessages[errorCode] ?? errorMessages.default;

  return (
    <>
      <Head>
        <title>เกิดข้อผิดพลาดในการเข้าสู่ระบบ</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8 text-center">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-md">
          <h1 className="mb-4 text-2xl font-semibold text-red-600">🚫 เข้าสู่ระบบไม่สำเร็จ</h1>
          <p className="mb-6 text-gray-700">{errorMessage}</p>
          <Link href="/login">
            <span className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">
              กลับไปหน้าเข้าสู่ระบบ
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
