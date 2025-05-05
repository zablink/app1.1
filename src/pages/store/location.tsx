// pages/store/location.tsx
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useSession } from "next-auth/react";

const supabase = createClient();

export default function StoreLocation() {
  const { data: session } = useSession();
  const mapRef = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const defaultCenter = { lat: 13.7563, lng: 100.5018 }; // Bangkok

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
    });

    mapInstance.addListener("click", (e) => {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setLocation(pos);

      if (marker) marker.setMap(null);

      const newMarker = new google.maps.Marker({
        position: pos,
        map: mapInstance,
        draggable: true,
      });

      newMarker.addListener("dragend", () => {
        const p = newMarker.getPosition();
        if (p) setLocation({ lat: p.lat(), lng: p.lng() });
      });

      setMarker(newMarker);
    });

    setMap(mapInstance);
  }, []);

  const saveLocation = async () => {
    if (!location || !session?.user?.email) return alert("กรุณาเลือกพิกัดก่อน");

    const { error } = await supabase
      .from("stores")
      .update({ latitude: location.lat, longitude: location.lng })
      .eq("email", session.user.email); // ใช้ email เป็น key

    if (error) alert("บันทึกไม่สำเร็จ: " + error.message);
    else alert("บันทึกพิกัดเรียบร้อยแล้ว");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">ระบุตำแหน่งร้านค้าของคุณ</h1>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} className="mb-4" />
      {location && (
        <p className="mb-2">
          พิกัด: lat {location.lat.toFixed(5)}, lng {location.lng.toFixed(5)}
        </p>
      )}
      <button
        onClick={saveLocation}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        บันทึกตำแหน่ง
      </button>
    </div>
  );
}
