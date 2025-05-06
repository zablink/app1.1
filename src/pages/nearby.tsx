// pages/nearby.tsx
import { useEffect, useState } from "react";

type Store = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};


export default function NearbyStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNearbyStores();
  }, [radius, category]);

  const fetchCategories = async () => {
    const res = await fetch("/api/store-categories");
    const data = await res.json();
    setCategories(data.categories);
  };

  const fetchNearbyStores = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      let url = `/api/nearby-stores?lat=${lat}&lng=${lng}&radius=${radius}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const json = await res.json();
      setStores(json.stores || []);
      setLoading(false);
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ร้านค้าใกล้คุณ</h1>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <label>
          ระยะทาง (กม.):
          <input
            type="number"
            min={1}
            max={20}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="ml-2 px-2 py-1 border rounded"
          />
        </label>
        <label>
          หมวดหมู่:
          <select
            className="ml-2 px-2 py-1 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p>กำลังค้นหาร้านค้าใกล้คุณ...</p>
      ) : stores.length === 0 ? (
        <p>ไม่พบร้านค้าในบริเวณนี้</p>
      ) : (
        <ul className="space-y-3">
          {stores.map((store) => (
            <li key={store.id} className="border p-3 rounded">
              <a href={`/store/${store.id}`} className="text-blue-600 hover:underline">
                <strong>{store.name}</strong>
              </a><br />
              พิกัด: {store.latitude}, {store.longitude}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
