// pages/api/admin/reported-reviews.ts

import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer
import { getServerSession } from "next-auth/next"; // ใช้ getServerSession จาก next-auth/next
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // ตรวจสอบ path ให้ถูกต้อง
import { Session } from "next-auth"; // นำเข้า Session จาก next-auth

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Method Not Allowed
  }

  // ตรวจสอบ session และบอก TypeScript ว่า session เป็นประเภท Session
  const session = await getServerSession(req, res, authOptions);

  // ตรวจสอบว่ามี session และ role เป็น admin หรือไม่
  if (!session || !(session as Session).user?.role || (session as Session).user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  try {
    // ดึงข้อมูลรีวิวที่ถูกแจ้งจากฐานข้อมูล Supabase
    // **ใช้ supabaseServer ที่ import มา**
    const { data, error } = await supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
      .from("review_reports_view") // อาจใช้ view ที่ join review + user + store แล้ว
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reported reviews:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ reports: data });
  } catch (error: any) {
    console.error("Unexpected error in reported-reviews API:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
