// src/components/StoreDashboard.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase"; // <--- แก้ไขตรงนี้: import createClient (ฟังก์ชัน) แทน supabase

// หากคุณใช้ dynamic import สำหรับแผนที่หรือส่วนอื่นๆ ที่ต้องการรันบน client เท่านั้น
import dynamic from "next/dynamic";

// ตัวอย่างการใช้ dynamic import สำหรับ GoogleMap (ถ้ามี)
// const GoogleMap = dynamic(() => import('@react-google-maps/api').then(mod => mod.GoogleMap), { ssr: false });

export default function StoreDashboard() {
  const router = useRouter();
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // **สร้าง Supabase client instance ภายใน Component**
  // เพื่อให้แน่ใจว่ามันถูกสร้างเมื่อรันบน Client-side และใช้ตัวแปร NEXT_PUBLIC_
  const supabase = createClient(); // <--- เรียกใช้ createClient() เพื่อรับ instance

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        // ดึง session จาก NextAuth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session || !session.user?.id) {
          // หากไม่มี session หรือ user id ให้ redirect ไปหน้า login
          router.push('/login');
          return;
        }

        // สมมติว่า role ของ store ถูกเก็บใน session.user.role
        // และคุณต้องการให้เฉพาะ 'store' หรือ 'admin' เข้าถึงได้
        if (session.user.role !== 'store' && session.user.role !== 'admin') {
          setError("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
          setLoading(false);
          return;
        }

        // ดึงข้อมูลร้านค้าจาก Supabase โดยใช้ user ID
        const { data, error } = await supabase
          .from('stores') // สมมติว่ามีตาราง 'stores'
          .select('*')
          .eq('user_id', session.user.id) // สมมติว่า store ถูกผูกกับ user_id
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setStoreData(data);
      } catch (err: any) {
        console.error("Error fetching store data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [router, supabase]); // เพิ่ม supabase ใน dependency array

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">กำลังโหลดข้อมูลร้านค้า...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-xl text-red-600">เกิดข้อผิดพลาด: {error}</div>;
  }

  if (!storeData) {
    return <div className="flex justify-center items-center h-screen text-xl">ไม่พบข้อมูลร้านค้า</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">แผงควบคุมร้านค้า: {storeData.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">ข้อมูลร้านค้า</h2>
          <p className="text-gray-600 mb-2"><strong>ชื่อร้าน:</strong> {storeData.name}</p>
          <p className="text-gray-600 mb-2"><strong>ที่อยู่:</strong> {storeData.address}</p>
          <p className="text-gray-600 mb-2"><strong>เบอร์โทร:</strong> {storeData.phone}</p>
          <p className="text-gray-600 mb-2"><strong>อีเมล:</strong> {storeData.email}</p>
          {/* เพิ่มข้อมูลอื่นๆ ของร้านค้า */}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">สถานะร้านค้า</h2>
          <div className="flex items-center space-x-2">
            <Switch
              id="store-status"
              checked={storeData.is_open} // สมมติว่ามีฟิลด์ is_open
              onCheckedChange={async (checked) => {
                // อัปเดตสถานะใน Supabase
                const { error } = await supabase
                  .from('stores')
                  .update({ is_open: checked })
                  .eq('id', storeData.id);

                if (error) {
                  console.error("Error updating store status:", error.message);
                  alert("ไม่สามารถอัปเดตสถานะร้านค้าได้"); // ควรใช้ Modal
                } else {
                  setStoreData({ ...storeData, is_open: checked });
                }
              }}
            />
            <Label htmlFor="store-status" className="text-lg">
              {storeData.is_open ? "เปิดทำการ" : "ปิดทำการ"}
            </Label>
          </div>
          {/* เพิ่มการตั้งค่าอื่นๆ เช่น ช่วงเวลาทำการ */}
        </div>
      </div>

      {/* เพิ่มส่วนอื่นๆ ของ Dashboard เช่น รายการสินค้า, ออเดอร์, สถิติ */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">จัดการสินค้า</h2>
        {/* ตัวอย่างปุ่ม */}
        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
          เพิ่มสินค้าใหม่
        </button>
      </div>
    </div>
  );
}
