// pages/store/dashboard.tsx
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import StoreReviews from "@/components/StoreReviews";

const supabase = createClient();

type Link = {
  id: number;
  title: string;
  url: string;
  created_at: string;
};

export default function StoreDashboard() {
  const { data: session, status } = useSession();
  const [storeId, setStoreId] = useState<number | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [loading, setLoading] = useState(true);
  //const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user.role !== "store") {
      router.push("/unauthorized");
    } else {
      fetchStoreIdAndLinks();
    }
  }, [session, status, fetchStoreIdAndLinks, router]);

  const fetchStoreIdAndLinks = async () => {
    //const { data, error } = await supabase
    const { data, error: _ } = await supabase
      .from("stores")
      .select("id, latitude, longitude")
      .eq("user_id", session?.user.id)
      .single();

    if (!data) return;

    setStoreId(data.id);
    if (data.latitude && data.longitude) {
      setMarkerPosition({ lat: data.latitude, lng: data.longitude });
    }
    fetchLinks(data.id);
  };

  const fetchLinks = async (id: number) => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("store_id", id)
      .order("created_at", { ascending: false });

    setLinks(data || []);
    setLoading(false);
  };

  const handleAddLink = async () => {
    if (!storeId || !newLink.title || !newLink.url) return;

    const { error } = await supabase.from("links").insert({
      store_id: storeId,
      title: newLink.title,
      url: newLink.url,
      created_at: new Date().toISOString(),
    });

    setNewLink({ title: "", url: "" });
    fetchLinks(storeId);
  };

  const handleDeleteLink = async (id: number) => {
    await supabase.from("links").delete().eq("id", id);
    fetchLinks(storeId!);
  };

  const handleChangeLink = async (id: number, field: string, value: string) => {
    await supabase.from("links").update({ [field]: value }).eq("id", id);
    fetchLinks(storeId!);
  };

  if (loading) return <div className="p-8">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-6">
      <h1 className="text-2xl font-bold">แดชบอร์ดร้านค้า</h1>

      {/* เพิ่มลิงก์ใหม่ */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">เพิ่มลิงก์</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            placeholder="ชื่อลิงก์"
            className="border px-2 py-1 rounded w-full sm:w-auto"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
          />
          <input
            placeholder="URL"
            className="border px-2 py-1 rounded w-full sm:w-auto"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            onClick={handleAddLink}
          >
            เพิ่ม
          </button>
        </div>
      </div>

      {/* ลิงก์ทั้งหมด */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">ลิงก์ของคุณ</h2>
        {links.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีลิงก์</p>
        ) : (
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.id} className="border p-3 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={link.title}
                    onChange={(e) =>
                      handleChangeLink(link.id, "title", e.target.value)
                    }
                  />
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={link.url}
                    onChange={(e) =>
                      handleChangeLink(link.id, "url", e.target.value)
                    }
                  />
                </div>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDeleteLink(link.id)}
                >
                  ลบ
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* แผนที่ Google */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">ตำแหน่งร้านของคุณ</h2>
        <div className="h-80 w-full">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={marker}
            zoom={15}
            onClick={handleMapClick}
          >
            <Marker position={marker} draggable onDragEnd={(e) => {
              setMarker({ lat: e.latLng?.lat() || 0, lng: e.latLng?.lng() || 0 });
            }} />
          </GoogleMap>
        </div>

        {/* พิกัด */}
        <div className="text-sm text-gray-600 mt-2">
          พิกัดร้าน: ละติจูด {marker.lat.toFixed(6)}, ลองจิจูด {marker.lng.toFixed(6)}
        </div>

        <button
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleSaveLocation}
        >
          บันทึกตำแหน่ง
        </button>
      </div>


      {/* ส่วนแสดงรีวิว */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">รีวิวจากลูกค้า</h2>
        <StoreReviews storeId={storeId!} />
      </div>
    </div>
  );
}
