// /pages/api/store/[id]/related.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing store ID" });

  const { data, error } = await supabase.rpc("find_related_stores", {
    base_store_id: Number(id),
  });

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ relatedStores: data });
}
