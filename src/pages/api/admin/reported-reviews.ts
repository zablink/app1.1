// pages/api/admin/reported-reviews.ts
import { supabase } from "@/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"; // ใช้ getServerSession จาก next-auth/next
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Session } from "next-auth"; // นำเข้า Session จาก next-auth

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  // ตรวจสอบ session และบอก TypeScript ว่า session เป็นประเภท Session
  const session = await getServerSession(req, res, authOptions);
  
  // ตรวจสอบว่ามี session และ role เป็น admin หรือไม่
  if (!session || !(session as Session).user?.role || (session as Session).user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  // ดึงข้อมูลรีวิวที่ถูกแจ้งจากฐานข้อมูล Supabase
  const { data, error } = await supabase
    .from("review_reports_view") // อาจใช้ view ที่ join review + user + store แล้ว
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ reports: data });
}
