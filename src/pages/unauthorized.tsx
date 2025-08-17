// pages/unauthorized.tsx

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณากลับไปยังหน้าหลัก
        </p>
        <Link
          href="/"
          className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl transition"
        >
          กลับไปหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
