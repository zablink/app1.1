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

  const handleProvinceSelect = async () => {
    if (selectedProvince) {
      const { data } = await axios.get("/api/stores/by-province-name", {
        params: { province: selectedProvince },
      });
      setProvinceStores(data);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* มุมขวาบน: Login/Logout */}
      <div className="absolute top-4 right-6 flex items-center space-x-4">
        {status === "loading" && <span className="text-gray-500">กำลังตรวจสอบ...</span>}

        {status === "unauthenticated" && (
          <button
            onClick={() => signIn()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            เข้าสู่ระบบ
          </button>
        )}

        {status === "authenticated" && (
          <>
            <span className="text-green-700">ยินดีต้อนรับ, {session?.user?.name || "ผู้ใช้"}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded shadow"
            >
              ออกจากระบบ
            </button>
          </>
        )}
      </div>

      <h1 className="text-2xl font-bold">หน้าแรก</h1>

      {locationError && (
        <div className="text-red-600">
          ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาเปิด Location Service หรือเลือกจังหวัด:
          <div className="mt-2">
            <select
              className="border p-2"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="">เลือกจังหวัด</option>
              <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
              <option value="เชียงใหม่">เชียงใหม่</option>
              <option value="ขอนแก่น">ขอนแก่น</option>
              <option value="ภูเก็ต">ภูเก็ต</option>
            </select>
            <button
              onClick={handleProvinceSelect}
              className="ml-2 bg-gray-600 text-white px-4 py-1 rounded"
            >
              ค้นหา
            </button>
          </div>
        </div>
      )}

      {lat && lng && (
        <p className="text-gray-500">คุณอยู่ที่พิกัด lat: {lat.toFixed(5)}, lng: {lng.toFixed(5)}</p>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">ร้านค้าใกล้คุณ</h2>
        <ul className="space-y-2">
          {stores.map((store) => (
            <li key={store.id} className="border p-4 rounded shadow">
              <h3 className="font-bold text-lg">{store.name}</h3>
              <p>{store.description}</p>
              <p className="text-sm text-gray-500">{store.distance.toFixed(2)} กม.</p>
            </li>
          ))}
          {stores.length === 0 && provinceStores.length > 0 && (
            <>
              <h2 className="text-lg font-medium mt-6">ร้านค้าทั้งหมดในจังหวัด</h2>
              {provinceStores.map((store) => (
                <li key={store.id} className="border p-4 rounded shadow">
                  <h3 className="font-bold text-lg">{store.name}</h3>
                  <p>{store.description}</p>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">หมวดหมู่ร้านค้า</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded bg-blue-100">อาหาร</div>
          <div className="border p-4 rounded bg-green-100">เสื้อผ้า</div>
          <div className="border p-4 rounded bg-yellow-100">บริการ</div>
          <div className="border p-4 rounded bg-red-100">อื่นๆ</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">พื้นที่โฆษณา</h2>
        <div className="border h-32 rounded bg-gray-200 flex items-center justify-center">
          แบนเนอร์โฆษณา
        </div>
      </div>
    </div>
  );
}
