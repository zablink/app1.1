// pages/api/store-categories.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase.from("stores").select("category");
  if (error) return res.status(500).json({ error: error.message });

  const categories = Array.from(new Set(data.map((d) => d.category).filter(Boolean)));
  res.status(200).json({ categories });
}
