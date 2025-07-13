// pages/api/nearby-stores.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { lat, lng, radius = 5 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      error: "Missing coordinates"
    });
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);
  const distance = parseFloat(radius as string); // in kilometers

  try {
    // **ใช้ supabaseServer ที่ import มา**
    const { data: storesData, error } = await supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
      .from("stores")
      .select("id, name, latitude, longitude");

    if (error) {
      console.error("Error fetching stores from Supabase:", error.message);
      return res.status(500).json({
        error: error.message
      });
    }

    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const toRad = (x: number) => x * Math.PI / 180;

      const R = 6371; // Radius of Earth in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearbyStores = storesData?.filter((store) => {
      // ตรวจสอบว่า store.latitude และ store.longitude ไม่ใช่ null ก่อนใช้
      if (store.latitude === null || store.longitude === null) {
        return false; // ไม่รวมร้านที่ไม่มีพิกัด
      }
      const d = haversineDistance(latitude, longitude, store.latitude, store.longitude);
      return d <= distance;
    }) ?? [];

    return res.status(200).json({ stores: nearbyStores });
  } catch (error: any) {
    console.error("Unexpected error in nearby-stores API:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
