// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { createClient } from "@supabase/supabase-js"; // นำเข้า createClient จาก Supabase

// ตรวจสอบตัวแปรสภาพแวดล้อมสำหรับ Supabase Client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// สร้าง Supabase Client สำหรับใช้ในฝั่ง Client-side
// ใช้ anon key เพราะ service role key ไม่ควรถูกเปิดเผยในฝั่ง client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // สถานะสำหรับข้อความสำเร็จ
  const [showForgotPassword, setShowForgotPassword] = useState(false); // สถานะสำหรับสลับโหมดลืมรหัสผ่าน
  const router = useRouter();

  // ฟังก์ชัน handleLogin จะถูกเรียกเมื่อ Form ถูก Submit (สำหรับโหมด Login ปกติ)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null); // เคลียร์ข้อความสำเร็จ
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        if (result.error.includes("AuthMethodMismatch:")) {
          setError("คุณเคยเข้าสู่ระบบด้วยวิธีการอื่นแล้ว เช่น Google หรือ GitHub กรุณาใช้ช่องทางเดิม.");
        } else {
          setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        }
      } else {
        router.push("/");
      }
    } catch (e: any) {
      console.error("Unexpected login error:", e.message);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน handleForgotPassword จะถูกเรียกเมื่อ Form ถูก Submit (สำหรับโหมดลืมรหัสผ่าน)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // เรียกใช้ Supabase เพื่อส่งลิงก์รีเซ็ตรหัสผ่าน
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // คุณสามารถกำหนด URL ที่ผู้ใช้จะถูกเปลี่ยนเส้นทางไปหลังจากคลิกลิงก์ในอีเมล
        // ถ้าไม่กำหนด จะใช้ Site URL ที่ตั้งค่าไว้ใน Supabase Dashboard
        // ตัวอย่าง: redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error("Forgot password error:", error.message);
        setError("เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ต: " + error.message);
      } else {
        setSuccessMessage("เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย");
        setEmail(""); // ล้างอีเมลหลังจากส่งสำเร็จ
      }
    } catch (e: any) {
      console.error("Unexpected forgot password error:", e.message);
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
        {showForgotPassword ? "ลืมรหัสผ่าน?" : "เข้าสู่ระบบ"}
      </h1>

      {/* แสดงข้อความ Error หรือ Success */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Conditional Rendering ของ Form */}
      {showForgotPassword ? (
        // Form สำหรับลืมรหัสผ่าน
        <form onSubmit={handleForgotPassword}>
          <p className="text-gray-600 mb-4 text-center">
            กรุณากรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้
          </p>
          <input
            type="email"
            className="border border-gray-300 p-3 w-full mb-4 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md w-full transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </button>
          <button
            type="button"
            className="mt-4 text-blue-600 hover:underline w-full text-center"
            onClick={() => {
              setShowForgotPassword(false);
              setError(null);
              setSuccessMessage(null);
              setEmail("");
              setPassword("");
            }}
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </form>
      ) : (
        // Form สำหรับเข้าสู่ระบบปกติ
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="border border-gray-300 p-3 w-full mb-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="border border-gray-300 p-3 w-full mb-4 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md w-full transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <button
            type="button"
            className="mt-4 text-blue-600 hover:underline w-full text-center"
            onClick={() => {
              setShowForgotPassword(true);
              setError(null);
              setSuccessMessage(null);
              setEmail("");
              setPassword("");
            }}
          >
            ลืมรหัสผ่าน?
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-gray-700">
        ยังไม่มีบัญชี?{" "}
        <button
          className="text-blue-600 hover:underline font-semibold"
          onClick={() => router.push("/signup")}
        >
          สมัครสมาชิก
        </button>
      </p>
    </div>
  );
}
