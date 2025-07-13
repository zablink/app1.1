// pages/api/store/[id]/related.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  console.log('Hit store related:', req.query);

  if (!id) {
    return res.status(400).json({ error: "Missing store ID" });
  }

  try {
    // **ใช้ supabaseServer ที่ import มา**
    const { data, error } = await supabaseServer.rpc("find_related_stores", {
      base_store_id: Number(id), // ตรวจสอบให้แน่ใจว่า id เป็น Number
    });

    if (error) {
      console.error("Error calling find_related_stores RPC:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ relatedStores: data });
  } catch (error: any) {
    console.error("Unexpected error in related stores API:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
