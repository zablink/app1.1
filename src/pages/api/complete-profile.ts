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

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { full_name, nickname, phone } = req.body;

  if (!full_name || !nickname || !phone) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
  }

  // 🔍 หา user_id จากอีเมล
  const { data: userData, error: userError } = await supabase
    .from("nextauth_users")
    .select("id")
    .eq("email", session.user.email)
    .maybeSingle(); // ✅ ป้องกัน error ถ้าไม่เจอ

  if (userError || !userData?.id) {
    console.error("❌ ไม่พบผู้ใช้", userError);
    return res.status(500).json({ error: "ไม่พบผู้ใช้ในระบบ" });
  }

  const user_id = userData.id;

  // 🔍 เช็คว่ามี profile อยู่หรือยัง
  const { data: existingProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", user_id)
    .maybeSingle(); // ✅ ใช้ maybeSingle() แทน single()

  if (profileError) {
    console.error("❌ เช็คโปรไฟล์ล้มเหลว", profileError);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการตรวจสอบโปรไฟล์" });
  }

  if (existingProfile) {
    // ✅ update
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        full_name,
        nickname,
        phone,
        is_active: true,
      })
      .eq("user_id", user_id);

    if (updateError) {
      console.error("❌ อัปเดตล้มเหลว", updateError);
      return res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลได้" });
    }
  } else {
    // ✅ insert พร้อม catch duplicate (409)
    const { error: insertError } = await supabase.from("user_profiles").insert([
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
      console.error("❌ insert error", insertError);

      // 🔁 ถ้า error เกิดจาก duplicate key (เช่น user_id ซ้ำ)
      if (insertError.code === "23505" || insertError.message.includes("duplicate")) {
        return res.status(409).json({ error: "มีข้อมูลผู้ใช้อยู่แล้ว" });
      }

      return res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลได้" });
    }
  }

  return res.status(200).json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
}
