// pages/index.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getNearbyStores } from "@/lib/stores";
import Layout from "@/components/Layout";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stores, setStores] = useState<any[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // --- Console.log: ตรวจสอบสถานะและข้อมูล Session ทันทีที่ component ถูก render ---
  console.log('--- HomePage Component Render ---');
  console.log('Session Status:', status);
  console.log('Session Data (initial render):', session);
  if (session?.user) {
    console.log('Session User Name (initial render):', session.user.name);
    console.log('Session User Email (initial render):', session.user.email);
    console.log('Session User Image (initial render):', session.user.image);
    // @ts-ignore
    console.log('Session User Role (initial render):', session.user.role); // Log custom role
    // @ts-ignore
    console.log('Session User Membership Type (initial render):', session.user.membership_type); // Log custom membership_type
  } else {
    console.log('Session User is null or undefined on initial render.');
  }
  // --- End Console.log ---

  useEffect(() => {
    // --- Console.log: ตรวจสอบสถานะและข้อมูล Session เมื่อ useEffect สำหรับ fetch stores ทำงาน ---
    console.log('--- useEffect for fetching all stores triggered ---');
    console.log('Current Session Status in useEffect:', status);
    console.log('Current Session User Role in useEffect:', session?.user?.role);

    // --- Console.log: ตรวจสอบเงื่อนไขการแสดงปุ่ม "ไปที่แดชบอร์ด" ใน useEffect ---
    if (status === "authenticated" && session?.user?.role === "store") {
      console.log('User is authenticated and role is "store". Dashboard link should be visible.');
    } else if (status === "authenticated" && session?.user?.role !== "store") {
      console.log(`User is authenticated, but role is "${session?.user?.role}". Dashboard link should NOT be visible.`);
    } else if (status === "unauthenticated") {
      console.log('User is unauthenticated. Dashboard link should NOT be visible.');
    } else if (status === "loading") {
      console.log('Session is loading. Dashboard link visibility will be determined after load.');
    }
    // --- End Console.log for dashboard link ---

    fetch("/api/stores/all")
      .then(res => {
        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`);
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched all stores data:', data);
        setStores(data);
      })
      .catch(err => {
        console.error("Error fetching all stores:", err);
        console.log('Falling back to dummy stores.');
        setStores(dummyStores);
      });
  }, [status, session]); // เพิ่ม status และ session ใน dependency array เพื่อให้ console.log ทำงานเมื่อค่าเหล่านี้เปลี่ยน


  // ✅ ฟังก์ชันกดปุ่มเพื่อค้นหาร้านใกล้ตัว
  const handleFindNearby = () => {
    console.log('--- handleFindNearby triggered ---');
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      setLocationError(true);
      return;
    }

    setLoadingNearby(true);
    console.log('Attempting to get current geolocation position...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Geolocation successful: Latitude=${latitude}, Longitude=${longitude}`);
        try {
          const nearby = await getNearbyStores(latitude, longitude);
          console.log('Fetched nearby stores data:', nearby);
          setStores(nearby?.length > 0 ? nearby : dummyStores);
          if (nearby?.length === 0) {
            console.log('No nearby stores found, falling back to dummy stores.');
          }
        } catch (err) {
          console.error("Error loading nearby stores:", err);
          console.log('Falling back to dummy stores due to API error.');
          setStores(dummyStores);
        } finally {
          setLoadingNearby(false);
          console.log('Finished loading nearby stores.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        setLocationError(true);
        setStores(dummyStores);
        setLoadingNearby(false);
        console.log('Falling back to dummy stores due to geolocation error.');
      }
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-neutral px-4 py-8 text-gray-800">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ตรวจสอบเงื่อนไขการแสดงปุ่ม "ไปที่แดชบอร์ด" */}
          {status === "authenticated" && session?.user?.role === "store" && (
            <div className="flex justify-end">
              <Link
                href="/store/dashboard"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                ไปที่แดชบอร์ด
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl md:text-4xl font-semibold text-primary">
              ร้านอาหารแนะนำ
            </h1>
            <button
              onClick={handleFindNearby}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              {loadingNearby ? "กำลังค้นหา..." : "ค้นหาร้านใกล้ฉัน"}
            </button>
          </div>

          {locationError && (
            <p className="text-red-600">ไม่สามารถเข้าถึงตำแหน่งของคุณได้</p>
          )}

          {stores.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse space-y-4 rounded-xl bg-white shadow-md p-4"
                >
                  <div className="h-32 bg-gray-200 rounded-lg shimmer" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {stores.map((store) => {
                const imageUrl = store.cover_url || `/store-images/${store.id}.jpg` || "/default-cover.jpg";
                return (
                  <div
                    key={store.id}
                    className="group rounded-xl bg-white shadow-md hover:shadow-xl transition duration-300 cursor-pointer"
                    onClick={() => router.push(`/store/${store.id}`)}
                  >
                    <div className="h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <h2 className="text-lg font-medium text-primary group-hover:underline">
                        {store.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {store.description || store.category || "ไม่มีคำอธิบาย"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ✅ fallback ร้านตัวอย่าง
const dummyStores = [
  {
    id: "dummy1",
    name: "ร้านตัวอย่าง A",
    description: "ร้านอาหารญี่ปุ่นแนะนำ",
    cover_url: "/store-images/store1.jpg",
  },
  {
    id: "dummy2",
    name: "ร้านตัวอย่าง B",
    description: "ร้านชานมไข่มุกยอดฮิต",
    cover_url: "/store-images/store2.jpg",
  },
  {
    id: "dummy3",
    name: "ร้านตัวอย่าง C",
    description: "อาหารตามสั่งอร่อยๆ",
    cover_url: "/store-images/store3.jpg",
  },
];