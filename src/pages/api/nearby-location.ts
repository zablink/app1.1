// pages/api/nearby-location.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { latitude, longitude } = JSON.parse(req.body);

  const { data: stores } = await supabase.from("stores").select("*");

  if (!stores || stores.length === 0) {
    return res.status(200).json({ area: null });
  }

  // ค้นหาร้านที่อยู่ใกล้ในระยะ 5 กม.
  const nearby = stores.find((store) => {
    if (!store.latitude || !store.longitude) return false;
    const distance = haversine(latitude, longitude, store.latitude, store.longitude);
    return distance <= 5;
  });

  if (nearby) {
    return res.status(200).json({ area: nearby.subdistrict || nearby.district || nearby.province });
  }

  // fallback: หาตำบล / อำเภอ / จังหวัดเดียวกันตามลำดับ
  const levels = ["subdistrict", "district", "province"];

  for (const level of levels) {
    const match = stores.find((store) => store[level] && store[level] === req.body[level]);
    if (match) {
      return res.status(200).json({ area: match[level] });
    }
  }

  // สุดท้าย ไม่เจอเลย
  return res.status(200).json({ area: "all" });
}
