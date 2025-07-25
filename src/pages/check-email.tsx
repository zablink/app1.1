// /pages/check-email.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CheckEmailPage() {
  const router = useRouter();
  const { email } = router.query;
  const [displayEmail, setDisplayEmail] = useState("");

  useEffect(() => {
    if (email) {
      setDisplayEmail(email as string);
    }
  }, [email]);

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-2xl font-bold mb-4">ตรวจสอบอีเมลของคุณ</h1>
      <p className="mb-4">เราได้ส่งลิงก์ยืนยันไปยังอีเมล **{displayEmail || "ของคุณ"}**</p>
      <p className="mb-6">โปรดคลิกที่ลิงก์ในอีเมลเพื่อยืนยันบัญชีของคุณ</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => router.push("/login")} // นำกลับไปหน้า Login หรือหน้าแรก
      >
        กลับไปหน้า Login
      </button>
    </div>
  );
}