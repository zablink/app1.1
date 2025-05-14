import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
//import { getServerSession } from "next-auth/next"; // import getServerSession from next-auth/next
import { useSession } from "@auth/nextjs";
import { authOptions } from "../auth/[...nextauth]";
import { Session } from "next-auth"; // Import Session type

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ตรวจสอบ session และกำหนด type ให้ session
  const session = await getServerSession(req, res, authOptions) as Session;

  if (!session || session.user.role !== "admin") {
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
  if (startDate && endDate) {
    query = query
      .gte("changed_at", startDate as string)
      .lte("changed_at", endDate as string);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // แก้ไขการกรอง email ถ้าผลลัพธ์เป็น array ของ users
  const filtered = email
    ? data.filter((item) =>
        item.users?.some((user) => user.email?.toLowerCase().includes((email as string).toLowerCase()))
      )
    : data;

  return res.status(200).json({ history: filtered });
}
