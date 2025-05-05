// pages/login.tsx
import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage({ csrfToken }: { csrfToken: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

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

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <h1 className="text-2xl font-bold mb-4 text-center">เข้าสู่ระบบ</h1>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <label className="block mb-2 text-sm">Email</label>
        <input
          name="email"
          type="email"
          className="w-full px-3 py-2 mb-4 border rounded"
          required
        />

        <label className="block mb-2 text-sm">Password</label>
        <input
          name="password"
          type="password"
          className="w-full px-3 py-2 mb-4 border rounded"
          required
        />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <p className="text-center text-gray-500 text-sm">หรือเข้าสู่ระบบด้วย</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Google
        </button>
        <button
          onClick={() => signIn("facebook", { callbackUrl: "/" })}
          className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900"
        >
          Facebook
        </button>
      </div>
    </div>
  </div>
);


export async function getServerSideProps(context: any) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
