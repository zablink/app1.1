// pages/api/store/[id].ts

/*
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id;

  const { data: store, error } = await supabase
    .from("store_with_links")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ store });
}

*/
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const store = {
    id,
    name: "ร้านกาแฟสดริมทาง",
    description: "กาแฟหอมกรุ่น พร้อมบรรยากาศอบอุ่น",
    category: "เครื่องดื่ม",
  };

  res.status(200).json({ store });
}
