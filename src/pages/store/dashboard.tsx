export const dynamic = "force-dynamic";

//import { useSession } from "next-auth/react";
import { useSession } from '@auth/nextjs';
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Store = {
  id: string;
  name: string;
  email: string;
  membership_status: string;
  latitude?: number;
  longitude?: number;
};

export default function StoreDashboard() {
  const { data: session } = useSession();
  const [storeData, setStoreData] = useState<Store | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) console.error(error);
      else setStoreData(data as Store);
    };

    fetchData();
  }, [session]);

  if (!session) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">แดชบอร์ดร้านค้า</h1>
      {storeData ? (
        <div className="space-y-2">
          <p>ชื่อร้าน: {storeData.name}</p>
          <p>สถานะสมาชิก: {storeData.membership_status}</p>
          <Link href="/store/location" className="text-blue-600 underline">
            จัดการพิกัดร้าน
          </Link>
        </div>
      ) : (
        <p>ไม่พบข้อมูลร้านค้า</p>
      )}
    </div>
  );
}
