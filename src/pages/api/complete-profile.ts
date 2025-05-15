// pages/api/complete-profile.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { full_name, nickname, phone } = req.body;

  if (!full_name || !nickname || !phone) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
  }

  // ดึง user จาก email
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (userError || !userData) {
    return res.status(500).json({ error: "ไม่พบผู้ใช้ในระบบ" });
  }

  const user_id = userData.id;

  // เช็คว่ามี profile แล้วหรือยัง
  const { data: existingProfile } = await supabase
    .from("user_profile")
    .select("user_id")
    .eq("user_id", user_id)
    .single();

  if (existingProfile) {
    // update
    const { error: updateError } = await supabase
      .from("user_profile")
      .update({
        full_name,
        nickname,
        phone,
        is_active: true,
      })
      .eq("user_id", user_id);

    if (updateError) {
      return res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลได้" });
    }
  } else {
    // insert
    const { error: insertError } = await supabase.from("user_profile").insert([
      {
        user_id,
        full_name,
        nickname,
        phone,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      return res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลได้" });
    }
  }

  return res.status(200).json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
}
