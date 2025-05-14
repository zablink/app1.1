// pages/nearby.tsx
import { useEffect, useState } from "react";

type Store = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  subdistrict?: string;
  district?: string;
  province?: string;
  distance?: number;
};

type NearbyResult = {
  level: "radius" | "subdistrict" | "district" | "province" | "all";
  stores: Store[];
};

const levelMap = {
  radius: "ร้านค้าที่อยู่ในรัศมี 5 กม.",
  subdistrict: "ร้านในตำบลเดียวกัน",
  district: "ร้านในอำเภอเดียวกัน",
  province: "ร้านในจังหวัดเดียวกัน",
  all: "ร้านค้าทั้งหมด",
};

export default function NearbyPage() {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [level, setLevel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("ไม่สามารถเข้าถึงตำแหน่งของอุปกรณ์ได้");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const res = await fetch(`/api/stores/nearby?lat=${lat}&lng=${lng}`);
          const data: NearbyResult = await res.json();
          setStores(data.stores);
          setLevel(data.level);
        } catch (err) {
          console.error(err);
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูลร้านค้า");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("ไม่สามารถดึงตำแหน่งจากอุปกรณ์ได้");
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <p className="p-4">กำลังค้นหาร้านค้าใกล้คุณ...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ร้านค้าใกล้คุณ</h1>
      {level && <p className="mb-2 text-gray-700">🔍 {levelMap[level as keyof typeof levelMap]}</p>}

      {stores.length === 0 ? (
        <p>ไม่พบร้านค้าในพื้นที่</p>
      ) : (
        <ul className="space-y-2">
          {stores.map((store) => (
            <li key={store.id} className="p-2 border rounded">
              <p className="font-semibold">{store.name}</p>
              {store.distance && (
                <p className="text-sm text-gray-500">ห่าง {store.distance.toFixed(2)} กม.</p>
              )}
              <p className="text-sm text-gray-600">
                {store.subdistrict} {store.district} {store.province}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
