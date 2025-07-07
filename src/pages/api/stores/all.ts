// pages/api/stores/all.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from("stores")
      .select(`
        *,
        subdistricts (
          id,
          name_th,
          district_id,
          districts (
            id,
            name_th,
            province_id,
            provinces (
              id,
              name_th
            )
          )
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
