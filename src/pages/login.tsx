'use client';

import { useEffect, useState } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";

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
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email.value,
      password: form.password.value,
      callbackUrl: "/",
    });

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
      router.push(res?.url || "/");
    }
  };

  const handleOAuthLogin = async (provider: "google" | "facebook") => {
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">เข้าสู่ระบบ</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="csrfToken" type="hidden" value={csrfToken} />

          <input
            name="email"
            type="email"
            required
            placeholder="อีเมล"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="รหัสผ่าน"
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            เข้าสู่ระบบด้วย Google
          </button>
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900"
          >
            เข้าสู่ระบบด้วย Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
