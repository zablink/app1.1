// pages/index.tsx
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";

export default function HomePage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status ?? "loading";

  const router = useRouter();

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [provinceStores, setProvinceStores] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.provider && session.user.isNewUser) {
      router.push("/complete-profile");
    }
  }, [session, status, router]);

  /*
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        axios
          .get("/api/stores/nearby", {
            params: { lat: latitude, lng: longitude },
          })
          .then((res) => {
            if (res.data.length > 0) {
              setStores(res.data);
            } else {
              axios.get("/api/stores/by-province", { params: { lat: latitude, lng: longitude } }).then((r) => {
                setProvinceStores(r.data);
              });
            }
          });
      },
      () => {
        setLocationError(true);
      }
    );
  }, []);
  */

    useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        axios
          .get("/api/stores/nearby", {
            params: { lat: latitude, lng: longitude },
          })
          .then((res) => {
            if (res.data.length > 0) {
              setStores(res.data);
            } else {
              // ถ้าไม่เจอร้านใกล้เลย → ใช้ dummy แทน
              setStores([
                {
                  id: "dummy1",
                  name: "ร้านตัวอย่าง A",
                  description: "ร้านอาหารญี่ปุ่นแนะนำ",
                  coverUrl: "/mock/store1.jpg",
                },
                {
                  id: "dummy2",
                  name: "ร้านตัวอย่าง B",
                  description: "ร้านชานมไข่มุกยอดฮิต",
                  coverUrl: "/mock/store2.jpg",
                },
                {
                  id: "dummy3",
                  name: "ร้านตัวอย่าง C",
                  description: "อาหารตามสั่งอร่อยๆ",
                  coverUrl: "/mock/store3.jpg",
                },
              ]);
            }
          })
          .catch(() => {
            // ถ้า error → ใช้ dummy
            setStores([
              {
                id: "dummy1",
                name: "ร้านตัวอย่าง A",
                description: "ร้านอาหารญี่ปุ่นแนะนำ",
                coverUrl: "/mock/store1.jpg",
              },
              {
                id: "dummy2",
                name: "ร้านตัวอย่าง B",
                description: "ร้านชานมไข่มุกยอดฮิต",
                coverUrl: "/mock/store2.jpg",
              },
              {
                id: "dummy3",
                name: "ร้านตัวอย่าง C",
                description: "อาหารตามสั่งอร่อยๆ",
                coverUrl: "/mock/store3.jpg",
              },
            ]);
          });
      },
      () => {
        setLocationError(true);
        // ถ้าระบุตำแหน่งไม่ได้เลย → แสดง dummy เช่นกัน
        setStores([
          {
            id: "dummy1",
            name: "ร้านตัวอย่าง A",
            description: "ร้านอาหารญี่ปุ่นแนะนำ",
            coverUrl: "/mock/store1.jpg",
          },
          {
            id: "dummy2",
            name: "ร้านตัวอย่าง B",
            description: "ร้านชานมไข่มุกยอดฮิต",
            coverUrl: "/mock/store2.jpg",
          },
          {
            id: "dummy3",
            name: "ร้านตัวอย่าง C",
            description: "อาหารตามสั่งอร่อยๆ",
            coverUrl: "/mock/store3.jpg",
          },
        ]);
      }
    );
  }, []);


  const handleProvinceSelect = async () => {
    if (selectedProvince) {
      const { data } = await axios.get("/api/stores/by-province-name", {
        params: { province: selectedProvince },
      });
      setProvinceStores(data);
    }
  };

  return (
      <div className="min-h-screen bg-neutral px-4 py-8 text-gray-800">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-primary">ร้านอาหารใกล้คุณ</h1>

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
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="group rounded-xl bg-white shadow-md hover:shadow-xl transition duration-300 cursor-pointer"
                  onClick={() => router.push(`/store/${store.id}`)}
                >
                  <div className="h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                    <img
                      src={store.coverUrl || "/default-cover.jpg"}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h2 className="text-lg font-medium text-primary">{store.name}</h2>
                    <p className="text-sm text-gray-500">{store.description || "ไม่มีคำอธิบาย"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
}
