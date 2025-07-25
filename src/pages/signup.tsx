// pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/lib/supabase";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => { // รับ event เข้ามา
    e.preventDefault(); // <<--- สำคัญ: ป้องกันการรีเฟรชหน้าเว็บเมื่อฟอร์มถูก Submit
    setError(null);
    setLoading(true);

    if (password !== repeatPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      console.error("Signup error:", signupError.message);
      setError(signupError.message);
    } else {
      if (signUpData.user) {
        try {
          const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl: "/",
          });

          if (result?.error) {
            console.error("Auto-login after signup error:", result.error);
            setError("สมัครสมาชิกสำเร็จ แต่เข้าสู่ระบบอัตโนมัติไม่สำเร็จ กรุณาลองเข้าสู่ระบบด้วยตนเอง");
            router.push("/login");
          } else {
            router.push("/");
          }
        } catch (autoLoginError: any) {
          console.error("Exception during auto-login after signup:", autoLoginError.message);
          setError("เกิดข้อผิดพลาดหลังการสมัครสมาชิก กรุณาลองเข้าสู่ระบบด้วยตนเอง");
          router.push("/login");
        }
      } else {
          setError("สมัครสมาชิกสำเร็จ แต่มีข้อผิดพลาดบางอย่าง กรุณาเข้าสู่ระบบอีกครั้ง");
          router.push("/login");
      }
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

      {/* <<--- เปลี่ยน div เป็น form และเพิ่ม onSubmit handler --- >> */}
      <form onSubmit={handleSignup}>
        <input
          type="email"
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border p-2 w-full mb-2"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="ยืนยันรหัสผ่าน"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
        />
        <button
          type="submit" // <<--- สำคัญ: กำหนด type เป็น submit
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>
      </form> {/* <<--- ปิดแท็ก form */}
    </div>
  );
}