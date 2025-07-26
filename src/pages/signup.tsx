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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // --- Console.log: เริ่มต้นการสมัครสมาชิก ---
    console.log('--- Attempting Signup ---');
    console.log('Email:', email);
    // --- End Console.log ---

    if (password !== repeatPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      console.log('Signup failed: Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      console.log('Signup failed: Password too short.');
      return;
    }

    const { data: signUpData, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      console.error("Signup error:", signupError.message);
      setError(signupError.message);
      setLoading(false);
    } else {
      if (signUpData.user) {
        // --- Console.log: สมัครสมาชิก Supabase สำเร็จ ---
        console.log('Supabase signup successful. User:', signUpData.user);

        try {
          // --- ขั้นตอนสำคัญ: สร้าง User Profile ใน Supabase (ตาราง 'profiles') ---
          // กำหนดแค่ id, email และ role พื้นฐานเป็น 'user'
          // ส่วน name, avatar จะให้ผู้ใช้เพิ่มทีหลังผ่านหน้า settings/edit profile
          console.log('Creating user profile in Supabase "profiles" table with default role...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: signUpData.user.email,
              role: 'user', // <<< กำหนด role เริ่มต้นเป็น 'user' ที่นี่
              // ไม่ได้ใส่ name หรือ avatar_url ในขั้นตอนนี้
            });

          if (profileError) {
            console.error("Error creating user profile in 'profiles' table:", profileError.message);
            setError("สมัครสมาชิกสำเร็จ แต่สร้างโปรไฟล์เริ่มต้นไม่ได้ กรุณาติดต่อผู้ดูแลระบบ");
            setLoading(false);
            return;
          }
          console.log('User profile with default role created successfully:', profileData);
          // --- จบขั้นตอนการสร้าง User Profile ---

          // --- Console.log: พยายาม Auto-login ---
          console.log('Attempting auto-login with NextAuth...');
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
            console.log('Auto-login successful, redirecting to home page.');
            router.push("/");
          }
        } catch (autoLoginError: any) {
          console.error("Exception during auto-login after signup:", autoLoginError.message);
          setError("เกิดข้อผิดพลาดหลังการสมัครสมาชิก กรุณาลองเข้าสู่ระบบด้วยตนเอง");
          router.push("/login");
        }
      } else {
        console.warn("Signup successful, but signUpData.user is null.");
        setError("สมัครสมาชิกสำเร็จ แต่มีข้อผิดพลาดบางอย่าง กรุณาเข้าสู่ระบบอีกครั้ง");
        router.push("/login");
      }
    }
    setLoading(false);
    console.log('--- Signup process finished ---');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">สมัครสมาชิก</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">อีเมล</label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">รหัสผ่าน</label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="repeatPassword" className="block text-gray-700 text-sm font-bold mb-2">ยืนยันรหัสผ่าน</label>
          <input
            type="password"
            id="repeatPassword"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="ยืนยันรหัสผ่าน"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          disabled={loading}
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>
      </form>
    </div>
  );
}