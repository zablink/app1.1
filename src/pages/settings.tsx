// /pages/settings.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react'; // ใช้ useSession สำหรับหน้า settings

import Layout from "@/components/Layout";

export default function SettingsPage() {
  const { data: session, status } = useSession(); // ดึง session และสถานะการโหลด
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      // ไม่ต้องทำอะไรขณะที่ session กำลังโหลด
      return;
    }
    if (!session) {
      // ถ้าไม่มี session (ไม่ได้ล็อกอิน) ให้ redirect ไปหน้า Login
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [session, status, router]); // dependencies ของ useEffect

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/' }); // Logout แล้ว Redirect ไปหน้าแรก
  };

  if (status === 'loading' || loading) {
    return <div className="text-center mt-20">กำลังโหลดการตั้งค่า...</div>;
  }

  if (!session) {
    return null; // ควรจะถูก redirect ไปหน้า Login แต่ถ้าหลุดมาถึงนี่ก็ไม่แสดงผล
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-4">การตั้งค่าผู้ใช้</h1>
        <p>ยินดีต้อนรับ, {session.user?.email}!</p>
        {/* เพิ่มฟอร์มและตัวเลือกการตั้งค่าของคุณที่นี่ */}
        <p className="mt-4">คุณสามารถจัดการโปรไฟล์และการตั้งค่าของคุณได้ที่นี่</p>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded mt-6"
          onClick={handleLogout}
          disabled={loading}
        >
          ออกจากระบบ
        </button>
      </div>
    </Layout>
  );
}