import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!id) return res.status(400).json({ error: "ต้องระบุ id" });

  const { data: store, error } = await supabase
    .from("store_with_links")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // ไม่เจอข้อมูลหรือ error จริง ๆ ส่ง store เป็น null แทน ไม่ต้องส่ง error
    // (เพื่อให้หน้าเว็บไม่ค้าง)
    return res.status(200).json({ store: null });
  }

  res.status(200).json({ store: store || null });
}
