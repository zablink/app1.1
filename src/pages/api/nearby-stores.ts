import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

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

  const { data: storesData, error } = await supabase
    .from("stores")
    .select("id, name, latitude, longitude");

  if (error) {
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
    const d = haversineDistance(latitude, longitude, store.latitude, store.longitude);
    return d <= distance;
  }) ?? [];

  return res.status(200).json({ stores: nearbyStores });
}
