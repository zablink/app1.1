import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const { userId, toType } = req.body;

  if (!userId || !toType) {
    return res.status(400).json({ error: "Missing userId or toType" });
  }

  // 1. ดึงข้อมูลเดิม
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("membership_type")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: "User not found" });
  }

  const fromType = userData.membership_type;

  // 2. อัปเดต users table
  const { error: updateError } = await supabase
    .from("users")
    .update({ membership_type: toType })
    .eq("id", userId);

  if (updateError) {
    return res.status(500).json({ error: "Failed to update membership" });
  }

  // 3. บันทึก log
  const { error: logError } = await supabase.from("membership_history").insert([
    {
      user_id: userId,
      from_type: fromType,
      to_type: toType,
      changed_by_admin_id: session.user.email, // หรือ session.user.id หากมี
      changed_at: new Date().toISOString(),
    },
  ]);

  if (logError) {
    return res.status(500).json({ error: "Failed to log history" });
  }

  return res.status(200).json({ message: "Membership updated successfully" });
}
