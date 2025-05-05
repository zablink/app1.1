// pages/api/stores/nearby.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

// ฟังก์ชันคำนวณระยะทาง (Haversine formula)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of earth in KM
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

  const { data: stores, error } = await supabase.from("stores").select("*");

  if (error) return res.status(500).json({ error: error.message });

  const result = stores
    .map((store) => {
      const distance = haversineDistance(
        parseFloat(lat as string),
        parseFloat(lng as string),
        store.latitude,
        store.longitude
      );
      return { ...store, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .filter((s) => s.distance <= 5); // ในรัศมี 5 กม.

  res.status(200).json(result);
}
