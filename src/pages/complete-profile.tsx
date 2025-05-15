// pages/complete-profile.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    full_name: "",
    nickname: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/"); // หรือเส้นทางอื่นตาม flow
    } else {
      setErrorMsg(data.error || "เกิดข้อผิดพลาด");
    }

    setLoading(false);
  };

  if (status === "loading") return <p className="p-6">กำลังโหลด...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-semibold mb-4 text-center">กรอกข้อมูลเพิ่มเติม</h1>

        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
          placeholder="ชื่อ-นามสกุล"
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          required
          placeholder="ชื่อเล่น"
          className="w-full border p-2 rounded"
        />

        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="เบอร์โทรศัพท์"
          className="w-full border p-2 rounded"
        />

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </form>
    </div>
  );
}
