// /pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState(""); // เพิ่ม state สำหรับ repeat password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // เพิ่ม state สำหรับจัดการข้อผิดพลาด
  const router = useRouter();

  const supabase = createClient();

  const handleSignup = async () => {
    setError(null); // ล้างข้อผิดพลาดก่อนเริ่มกระบวนการ
    setLoading(true);

    // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password !== repeatPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return; // หยุดกระบวนการถ้าไม่ตรงกัน
    }

    // ตรวจสอบความยาวรหัสผ่านขั้นต่ำ (เสริม)
    if (password.length < 6) { // Supabase กำหนดขั้นต่ำ 6 ตัวอักษร
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    const { data, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      console.error("Signup error:", signupError.message);
      // ควรใช้ SweetAlert2 หรือ Modal แทน alert()
      setError(signupError.message);
    } else {
      if (data.user) {
        // หากต้องการให้ Supabase ส่งอีเมลยืนยัน (Magic Link/OTP) โดยอัตโนมัติ
        // คุณไม่จำเป็นต้องสร้าง OTP เองที่นี่
        // Supabase จะจัดการการส่งอีเมลยืนยันไปที่ email ที่ผู้ใช้กรอก
        // ผู้ใช้จะต้องคลิกลิงก์ในอีเมลเพื่อยืนยันบัญชี

        // ถ้าคุณยังต้องการส่ง OTP ที่สร้างเองเหมือนเดิม
        // คุณต้องแน่ใจว่าได้ปิดการยืนยันอีเมลอัตโนมัติของ Supabase หรือตั้งค่าให้เหมาะสม
        // และเตรียม API route /api/send-otp ไว้ตามที่อธิบายไปก่อนหน้า
        // ตัวอย่างการส่ง OTP ที่สร้างเอง (ถ้าคุณเลือกทางนี้)
        /*
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const response = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
          console.error("Failed to send OTP.");
          setError("ไม่สามารถส่ง OTP ได้ โปรดลองอีกครั้ง");
          setLoading(false);
          return;
        }
        router.push(`/verify-otp?email=${email}`);
        */

        // หากใช้ Supabase Email Confirmation (ค่าเริ่มต้น)
        // หลัง signup สำเร็จ Supabase จะส่งอีเมลยืนยันไป ผู้ใช้ต้องไปกดยืนยันในอีเมล
        // จากนั้นจึงจะสามารถ login ได้
        alert("สมัครสมาชิกสำเร็จ! โปรดตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี");
        router.push("/"); // หรือไปหน้า Login
      } else {
        // กรณีที่ Supabase ไม่ได้คืนค่า user กลับมาทันที (เช่น ต้องยืนยันอีเมลก่อน)
        alert("โปรดตรวจสอบอีเมลของคุณเพื่อยืนยันการสมัครสมาชิก");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">สมัครสมาชิก</h1>

      {error && ( // แสดงข้อความ error ถ้ามี
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <input
        type="email"
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full mb-2"
        placeholder="รหัสผ่าน"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full mb-4"
        placeholder="ยืนยันรหัสผ่าน"
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>
    </div>
  );
}