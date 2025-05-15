// /pages/signup.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      // สร้าง OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      router.push(`/verify-otp?email=${email}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">สมัครสมาชิก</h1>
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
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </button>
    </div>
  );
}
