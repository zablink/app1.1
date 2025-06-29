import { useEffect, useState } from "react";

export default function Nearby() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);

          // เรียก API หลังได้พิกัด
          fetch(`/pages/api/stores/nearby?lat=${lat}&lng=${lng}`)
            .then((res) => res.json())
            .then((data) => setStores(data));
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">ร้านค้าใกล้คุณ</h1>

      {/* 👇 Debug: แสดงพิกัดของผู้ใช้ */}
      {latitude && longitude && (
        <p className="mb-4 text-sm text-gray-500">
          Your Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}

      <ul className="space-y-4">
        {stores.map((store: any) => (
          <li key={store.id} className="border p-3 rounded">
            <h2 className="text-lg font-semibold">{store.name}</h2>
            <p className="text-sm text-gray-600">
              อยู่ห่าง: {store.distance.toFixed(2)} กม.
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
