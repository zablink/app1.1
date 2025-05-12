import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { supabase } from "@/lib/supabase";
import { Session } from "next-auth"; // Import type Session

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  
  // Type assertion: บอก TypeScript ว่า session เป็น Session
  if (!session || !(session as Session).user?.role || (session as Session).user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { userId, toType } = req.body as { userId: string; toType: string };
  const adminId = (session as Session).user.id; // ใช้ session ที่เป็น type แล้ว

  const { error: updateError } = await supabase
    .from("users")
    .update({ membership_type: toType })
    .eq("id", userId);

  if (updateError) return res.status(500).json({ error: updateError.message });

  const { error: logError } = await supabase.from("membership_history").insert([
    {
      user_id: userId,
      from_type: "unknown", // คุณอาจต้อง query ค่าสถานะเดิมถ้าต้องการ
      to_type: toType,
      changed_by_admin_id: adminId,
      changed_at: new Date().toISOString(),
    },
  ]);

  if (logError) return res.status(500).json({ error: logError.message });

  return res.status(200).json({ success: true });
}
