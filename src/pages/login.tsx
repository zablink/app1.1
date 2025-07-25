// /pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleLogin = async () => {
    setError(null); // ล้างข้อความ error เก่า
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("Login error:", loginError.message);
      setError(loginError.message); // แสดง error ที่เกิดจากการ Login
    } else {
      // ถ้า Login สำเร็จ 'data.user' จะมีข้อมูลผู้ใช้
      if (data.user) {
        alert("เข้าสู่ระบบสำเร็จ!");
        // **สำคัญ:** นำทางผู้ใช้ไปยังหน้า Protected Page ของคุณ
        // ตรวจสอบให้แน่ใจว่าคุณมีหน้าเช่น /dashboard หรือ /profile
        router.push("/dashboard"); // <--- เปลี่ยนตรงนี้เป็น Path ของหน้าที่ต้องการให้ผู้ใช้ไปหลัง Login สำเร็จ
      } else {
        // กรณีนี้อาจเกิดขึ้นได้ถ้าต้องการยืนยันอีเมล แต่เราได้ปิดไปแล้ว
        setError("เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล");
      }
    }
    setLoading(false);
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