// pages/api/stores/nearby.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

// ฟังก์ชันคำนวณระยะทาง
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lng } = req.query;

  if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

  const userLat = parseFloat(lat as string);
  const userLng = parseFloat(lng as string);

  // ดึงร้านทั้งหมดพร้อมพิกัด
  const { data: stores, error } = await supabase.from("stores").select(`
    *,
    subdistricts (
      id, district_id,
      districts (
        id, province_id
      )
    )
  `);

  if (error) return res.status(500).json({ error: error.message });

  // คำนวณระยะทางทั้งหมด
  const storesWithDistance = stores.map((store) => {
    const distance = haversineDistance(
      userLat,
      userLng,
      store.latitude,
      store.longitude
    );
    return { ...store, distance };
  });

  // ขั้นที่ 1: ร้านในรัศมี 5 กม.
  const within5km = storesWithDistance.filter((s) => s.distance <= 5);
  if (within5km.length > 0)
    return res.status(200).json(
      within5km.sort((a, b) => a.distance - b.distance)
    );

  // ขั้นที่ 2: หาตำบลที่ใกล้ที่สุดจากตำแหน่ง lat/lng นี้
  const { data: nearestSubdistrict, error: geoErr } = await supabase.rpc(
    "find_nearest_subdistrict", // → ต้องมีฟังก์ชันใน PostgreSQL
    { user_lat: userLat, user_lng: userLng }
  );

  if (geoErr || !nearestSubdistrict)
    return res.status(500).json({ error: "Cannot find nearby subdistrict" });

  const subId = nearestSubdistrict.id;
  const districtId = nearestSubdistrict.district_id;
  const provinceId = nearestSubdistrict.districts.province_id;

  // ขั้นที่ 2: ตำบลเดียวกัน
  const sameSubdistrict = stores.filter(
    (s) => s.subdistrict_id === subId
  );
  if (sameSubdistrict.length > 0)
    return res.status(200).json(sameSubdistrict);

  // ขั้นที่ 3: อำเภอเดียวกัน
  const sameDistrict = stores.filter(
    (s) => s.subdistricts?.district_id === districtId
  );
  if (sameDistrict.length > 0)
    return res.status(200).json(sameDistrict);

  // ขั้นที่ 4: จังหวัดเดียวกัน
  const sameProvince = stores.filter(
    (s) => s.subdistricts?.districts?.province_id === provinceId
  );
  if (sameProvince.length > 0)
    return res.status(200).json(sameProvince);

  // ขั้นที่ 5: default - ร้านทั้งหมด
  return res.status(200).json(stores);
}
