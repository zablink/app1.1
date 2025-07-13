// /pages/store/location.tsx

import { useEffect, useRef, useState } from "react";
// import { createClient } from "@supabase/supabase-js"; // <--- ลบ import นี้ออก
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { createClient as createClientSideSupabase } from "@/lib/supabase"; // <--- Import createClient จาก lib/supabase

// **ลบ** การสร้าง supabase client ที่ Top-level ออกไป:
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

function StoreLocationInner() {
  const { data: session, status } = useSession();
  const mapRef = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // **สร้าง Supabase client instance ภายใน Component**
  // นี่คือตำแหน่งที่ถูกต้องสำหรับ Client-side component
  const supabase = createClientSideSupabase(); // <--- เรียกใช้ createClientSideSupabase()

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!window.google || !mapRef.current) return;

    const defaultCenter = { lat: 13.7563, lng: 100.5018 };

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
    });

    mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
      const pos = { lat: e.latLng!.lat(), lng: e.latLng!.lng() };
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
  }, [marker, status]);

  const saveLocation = async () => {
    if (!location || !session?.user?.id) { // ใช้ session.user.id แทน email เพื่อความสอดคล้อง
      alert("กรุณาเลือกพิกัดและเข้าสู่ระบบก่อน"); // ควรใช้ Modal
      return;
    }

    try {
      const { error } = await supabase
        .from("stores")
        .update({ latitude: location.lat, longitude: location.lng })
        .eq("user_id", session.user.id); // สมมติว่าผูก store กับ user_id

      if (error) {
        throw new Error(error.message);
      }
      alert("บันทึกพิกัดเรียบร้อยแล้ว"); // ควรใช้ Modal
    } catch (err: any) {
      console.error("Error saving location:", err.message);
      alert("บันทึกไม่สำเร็จ: " + err.message); // ควรใช้ Modal
    }
  };

  if (status === "loading") return <p>กำลังโหลด...</p>;
  if (status === "unauthenticated") return <p>กรุณาเข้าสู่ระบบ</p>;

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

export default dynamic(() => Promise.resolve(StoreLocationInner), {
  ssr: false,
});
