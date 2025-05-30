'use client';

import { useEffect, useState } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getCsrfToken();
      if (token) setCsrfToken(token);
    };
    fetchToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/",
    });

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
      router.push(res?.url || "/");
    }
  };

  const handleOAuthLogin = async (provider: "google" | "facebook" | "tiktok") => {
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6 tracking-tight">
          เข้าสู่ระบบ
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="csrfToken" type="hidden" value={csrfToken} />

          <input
            name="email"
            type="email"
            required
            placeholder="อีเมล"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
          />

          <input
            name="password"
            type="password"
            required
            placeholder="รหัสผ่าน"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all font-medium"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ยังไม่มีบัญชี?{" "}
          <Link href="/signup" className="text-gray-800 underline hover:text-black font-medium">
            สมัครสมาชิก
          </Link>
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            เข้าสู่ระบบด้วย Google
          </button>
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition"
          >
            เข้าสู่ระบบด้วย Facebook
          </button>
          <button
            onClick={() => handleOAuthLogin("tiktok")}
            disabled
            className="w-full flex items-center justify-center py-3 rounded-lg bg-black text-white opacity-50 cursor-not-allowed"
          >
            เข้าสู่ระบบด้วย TikTok (เร็ว ๆ นี้)
          </button>
        </div>
      </div>
    </div>
  );
}
