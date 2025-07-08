// pages/index.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getNearbyStores } from "@/lib/stores";
import Layout from "@/components/Layout";
console.log('Hey! its Layout');

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stores, setStores] = useState<any[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);

  useEffect(() => {
  fetch("/api/stores/all")
    .then(res => res.json())
    .then(data => setStores(data))
    .catch(err => {
      console.error("Error fetching all stores:", err);
      setStores(dummyStores);
    });
}, []);


  // ✅ ฟังก์ชันกดปุ่มเพื่อค้นหาร้านใกล้ตัว
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    setLoadingNearby(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const nearby = await getNearbyStores(latitude, longitude);
          setStores(nearby?.length > 0 ? nearby : dummyStores);
        } catch (err) {
          console.error("Error loading nearby stores:", err);
          setStores(dummyStores);
        } finally {
          setLoadingNearby(false);
        }
      },
      () => {
        setLocationError(true);
        setStores(dummyStores);
        setLoadingNearby(false);
      }
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-neutral px-4 py-8 text-gray-800">
        <div className="max-w-5xl mx-auto space-y-8">

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
