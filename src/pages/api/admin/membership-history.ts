// pages/api/amdin/membership-history.ts

import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // ตรวจสอบ path ให้ถูกต้อง
import { Session } from "next-auth"; // Import Session type

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ตรวจสอบ session และกำหนด type ให้ session
  // ควรใช้ type guard หรือตรวจสอบก่อน cast เพื่อความปลอดภัย
  const session = await getServerSession(req, res, authOptions);

  if (!session || !(session as Session).user?.role || (session as Session).user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const { email, startDate, endDate } = req.query;

  try {
    // เตรียม query
    // **ใช้ supabaseServer ที่ import มา**
    let query = supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
      .from("membership_history")
      .select(`
        id,
        from_type,
        to_type,
        changed_by_admin_id,
        changed_at,
        users:user_id ( // สมมติว่า user_id เป็น Foreign Key ไปยังตาราง users (public.users หรือ auth.users)
          id,
          email,
          name
        )
      `)
      .order("changed_at", { ascending: false });

    // เพิ่ม filter ถ้ามี
    if (startDate && endDate) {
      query = query
        .gte("changed_at", startDate as string)
        .lte("changed_at", endDate as string);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching membership history:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // แก้ไขการกรอง email
    // ตรวจสอบโครงสร้างของ data.users อีกครั้ง:
    // ถ้า users:user_id (id, email, name) หมายถึงมันจะ join ตาราง users เข้ามา
    // และ data[i].users จะเป็น object ของ user นั้นๆ (ไม่ใช่ array)
    const filtered = email
      ? data.filter((item: any) => // เพิ่ม type any ชั่วคราวเพื่อแก้ปัญหา TypeScript
          item.users && item.users.email?.toLowerCase().includes((email as string).toLowerCase())
        )
      : data;

    return res.status(200).json({ history: filtered });
  } catch (error: any) {
    console.error("Unexpected error in membership-history API:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
