// /pages/api/admin/change-membership.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer
import { Session } from "next-auth"; // Import type Session

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);

  // ตรวจสอบ session และ role
  if (!session || !(session as Session).user?.role || (session as Session).user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { userId, toType } = req.body as { userId: string; toType: string };

  // ใช้ session ที่เป็น type แล้ว
  const adminId = (session as Session).user.id;

  // **ใช้ supabaseServer ที่ import มา**
  const { error: updateError } = await supabaseServer
    .from("users") // หรือตารางที่คุณใช้เก็บข้อมูล user
    .update({ membership_type: toType })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating membership:", updateError.message);
    return res.status(500).json({ error: updateError.message });
  }

  // **ใช้ supabaseServer ที่ import มา**
  const { error: logError } = await supabaseServer.from("membership_history").insert([
    {
      user_id: userId,
      from_type: "unknown", // คุณอาจต้อง query ค่าสถานะเดิมถ้าต้องการ
      to_type: toType,
      changed_by_admin_id: adminId,
      changed_at: new Date().toISOString(),
    },
  ]);

  if (logError) {
    console.error("Error logging membership history:", logError.message);
    return res.status(500).json({ error: logError.message });
  }

  return res.status(200).json({ success: true });
}
