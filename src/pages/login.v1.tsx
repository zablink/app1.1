// /pages/login.tsx

'use client';

import { useEffect, useState } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");

  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect if already authenticated
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // --- ✅ Handle errors from NextAuth callback ---
    if (router.query.error) {
      const errorMessage = Array.isArray(router.query.error) 
        ? router.query.error[0] 
        : router.query.error;

      // Customize the error message based on the error thrown in the backend
      if (errorMessage.includes("To continue, sign in with")) {
        // Example: "To continue, sign in with google." -> "โปรดเข้าสู่ระบบด้วย Google"
        const provider = errorMessage.split(' ').pop()?.replace('.', '');
        const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "วิธีเดิม";
        setError(`อีเมลนี้เคยลงทะเบียนด้วย ${providerName} แล้ว โปรดเข้าสู่ระบบด้วย ${providerName}`);
      } else {
        // Generic error for other cases like "CredentialsSignin"
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    }

    const fetchToken = async () => {
      const token = await getCsrfToken();
      if (token) setCsrfToken(token);
    };
    fetchToken();
  }, [router.query.error]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Clear previous errors
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
    });

    if (res?.error) {
      // The useEffect for router.query.error will handle displaying the message
      // We just need to make sure the router is aware of the error state if needed
      router.push('/login?error=CredentialsSignin');
    } else {
      router.push(res?.url || "/");
    }
  };

  const handleOAuthLogin = async (provider: "google" | "facebook" | "tiktok") => {
    setError(""); // Clear previous errors before attempting login
    // The callbackUrl will be used upon successful login. 
    // If there's an error, the `signIn` callback will redirect to the error page (`/login` in our case).
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6 tracking-tight">
          เข้าสู่ระบบ
        </h1>

        {/* Error message display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
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

        {/* OAuth Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
            เข้าสู่ระบบด้วย Google
          </button>
          {/* Other OAuth buttons can be styled similarly */}
        </div>
      </div>
    </div>
  );
}
