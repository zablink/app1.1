// pages/api/nearby-stores.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

const EARTH_RADIUS_KM = 6371;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  const { category } = req.query;

  let { data: stores, error } = await supabase
    .from("stores")
    .select("id, name, latitude, longitude, category");

  if (error) return res.status(500).json({ error: error.message });

  if (category) {
    stores = stores.filter((s) => s.category === category);
  }


  const { lat, lng, radius = 5 } = req.query;

  if (!lat || !lng) return res.status(400).json({ error: "Missing coordinates" });

  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name, latitude, longitude");

  if (error) return res.status(500).json({ error: error.message });

  const nearbyStores = stores?.filter((store) => {
    if (!store.latitude || !store.longitude) return false;
    const distance = haversine(
      parseFloat(lat as string),
      parseFloat(lng as string),
      store.latitude,
      store.longitude
    );
    return distance <= Number(radius);
  });

  res.status(200).json({ stores: nearbyStores });
}
