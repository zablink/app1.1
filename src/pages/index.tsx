// /pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react"; // <<--- นำเข้า signIn จาก next-auth/react

// ไม่ต้องใช้ createClient และ supabase client แล้วสำหรับหน้า login ถ้าใช้ NextAuth Credentials
// import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // const supabase = createClient(); // บรรทัดนี้ไม่จำเป็นแล้ว

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // **เปลี่ยนมาเรียกใช้ signIn ของ NextAuth.js แบบ Credentials**
      const result = await signIn("credentials", {
        redirect: false, // สำคัญ: ป้องกันไม่ให้ NextAuth.js ทำ Redirect เอง
        email,
        password,
        callbackUrl: "/", // ระบุว่าให้ Redirect ไปที่ไหนเมื่อ Login สำเร็จ
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        // สามารถเช็ค error เฉพาะทางได้ถ้า Credentials Provider ของคุณส่งค่ามา
        if (result.error.includes("AuthMethodMismatch:")) {
            setError("คุณเคยเข้าสู่ระบบด้วยวิธีการอื่นแล้ว เช่น Google หรือ GitHub กรุณาใช้ช่องทางเดิม.");
        } else {
            setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); // ข้อความ error ทั่วไป
        }
      } else {
        // Login สำเร็จ: ทำ Redirect ไปหน้าแรกด้วยตนเอง
        router.push("/");
      }
    } catch (e: any) {
      console.error("Unexpected login error:", e.message);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>

      {error && (
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
        className="border p-2 w-full mb-4"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
      <p className="mt-4 text-center">
        ยังไม่มีบัญชี?{" "}
        <button
          className="text-blue-500 hover:underline"
          onClick={() => router.push("/signup")}
        >
          สมัครสมาชิก
        </button>
      </p>
    </div>
  );
}