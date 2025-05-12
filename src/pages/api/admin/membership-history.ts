import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next"; // import getServerSession from next-auth/next
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ตรวจสอบ session
  const session = await getServerSession(req, res, authOptions);
  
  // ใช้ Type assertion เพื่อบอก TypeScript ว่า session มี user
  if (!session || (session as { user: { role: string } }).user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const { email, startDate, endDate } = req.query;

  // เตรียม query
  let query = supabase
    .from("membership_history")
    .select(`
      id,
      from_type,
      to_type,
      changed_by_admin_id,
      changed_at,
      users:user_id (
        id,
        email,
        name
      )
    `)
    .order("changed_at", { ascending: false });

  // เพิ่ม filter ถ้ามี
  if (email) {
    // ต้องใช้ PostgREST RPC หรือ Supabase View ถ้าจะ filter ด้วย nested select
    // ทางออกชั่วคราวคือ filter แบบ client-side ด้านล่าง
  }

  if (startDate && endDate) {
    query = query
      .gte("changed_at", startDate as string)
      .lte("changed_at", endDate as string);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // filter email ที่ฝั่ง client (เนื่องจาก Supabase ไม่รองรับ ilike กับ nested field โดยตรง)
  const filtered = email
    ? data.filter((item) =>
        item.users?.email?.toLowerCase().includes((email as string).toLowerCase())
      )
    : data;

  return res.status(200).json({ history: filtered });
}
