// /pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      // ตรวจสอบ session ของผู้ใช้ปัจจุบัน
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // ถ้าไม่มี user (ยังไม่ได้ล็อกอิน) ให้ redirect ไปหน้า Login
        router.push('/login');
      } else {
        // ถ้ามี user ให้ตั้งค่า user state
        setUser(user);
      }
      setLoading(false);
    }

    getUser();

    // ฟังการเปลี่ยนแปลงสถานะการล็อกอิน (เช่น ผู้ใช้ออกจากระบบ, session หมดอายุ)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // ถ้าไม่มี session แล้ว (เช่น ออกจากระบบ) ให้ redirect ไปหน้า Login
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    // Clean-up function สำหรับ unsubscribe listener เมื่อ component ถูก unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, [router, supabase]); // dependencies ของ useEffect

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      setLoading(false);
    } else {
      // ถ้าออกจากระบบสำเร็จ ให้ redirect ไปหน้า Login
      router.push('/login');
    }
  };

  if (loading) {
    return <div className="text-center mt-20">กำลังโหลด...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-2xl font-bold mb-4">ยินดีต้อนรับสู่ Dashboard!</h1>
      {user && <p>คุณเข้าสู่ระบบด้วยอีเมล: {user.email}</p>}
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mt-6"
        onClick={handleLogout}
        disabled={loading}
      >
        ออกจากระบบ
      </button>
    </div>
  );
}