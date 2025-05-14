// components/StoreDashboard.tsx

//import { useSession } from "next-auth/react";
import { useSession } from '@auth/nextjs';
import { useEffect, useState } from "react";
import { Store } from "../types/store"; // ← import type ที่แยกไว้

export default function StoreDashboard() {
  const { data: session, status } = useSession();
  const [storeInfo, setStoreInfo] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!session?.user?.email) return;

      const res = await fetch(`/api/store?email=${session.user.email}`);
      const data = await res.json();
      setStoreInfo(data.store);
    };

    fetchStoreData();
  }, [session]);

  if (status === "loading") return <p>กำลังโหลดข้อมูล...</p>;
  if (!session) return <p>กรุณาเข้าสู่ระบบ</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ดร้านค้า</h1>
      {storeInfo ? (
        <div>
          <p>ชื่อร้าน: {storeInfo.name}</p>
          <p>หมวดหมู่: {storeInfo.category}</p>
          <p>แพ็กเกจ: {storeInfo.package}</p>
          <p>รหัสตำบล: {storeInfo.subdistrict_id}</p>
          {storeInfo.latitude && storeInfo.longtitude ? (
            <p>
              พิกัด: lat {storeInfo.latitude}, lng {storeInfo.longtitude}
            </p>
          ) : (
            <p>ยังไม่ได้กำหนดพิกัด</p>
          )}
          <p>สร้างเมื่อ: {new Date(storeInfo.created_at).toLocaleString()}</p>
        </div>
      ) : (
        <p>ไม่พบข้อมูลร้านค้า</p>
      )}
    </div>
  );
}
