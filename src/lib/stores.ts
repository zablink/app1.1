// lib/stores.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function getNearbyStores(lat: number, lng: number) {
  const { data, error } = await supabase.rpc("get_nearest_stores", {
    user_lat: lat,
    user_lng: lng,
  });

  if (error) {
    console.error("Supabase RPC error:", error.message);
    throw error;
  }

  return data;
}
