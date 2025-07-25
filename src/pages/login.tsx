// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ฟังก์ชัน handleLogin จะถูกเรียกเมื่อ Form ถูก Submit
  const handleLogin = async (e: React.FormEvent) => { // รับ event เข้ามา
    e.preventDefault(); // <<--- สำคัญ: ป้องกันการรีเฟรชหน้าเว็บเมื่อฟอร์มถูก Submit
    setError(null);
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

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* <<--- เปลี่ยน div เป็น form และเพิ่ม onSubmit handler --- >> */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required // <<--- เพิ่ม required เพื่อความสมบูรณ์ของฟอร์ม
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required // <<--- เพิ่ม required
        />
        <button
          type="submit" // <<--- สำคัญ: กำหนด type เป็น submit
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form> {/* <<--- ปิดแท็ก form */}

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