// /pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleSignup = async () => {
    setError(null); // Clear any previous errors
    setLoading(true);

    // 1. Validate Password and Repeat Password match
    if (password !== repeatPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    // 2. Validate Password length (Supabase default minimum is 6 characters)
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    // 3. Perform signup with Supabase
    // เมื่อ "Enable Email Confirmations" ถูกปิดใน Supabase Dashboard
    // ผู้ใช้จะถูกยืนยันอีเมลโดยอัตโนมัติและพร้อมใช้งานทันที
    const { data, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      console.error("Signup error:", signupError.message);
      setError(signupError.message); // Display error from Supabase
    } else {
      // Signup was successful. User is now active.
      alert("สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้ทันที");
      router.push("/login"); // Navigate directly to the login page
      // หรือ router.push("/"); ถ้าต้องการไปหน้าแรก
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">สมัครสมาชิก</h1>

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