// pages/api/complete-profile.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // ตรวจสอบ path ให้ถูกต้อง
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  console.log("Check-profile before check Session"); // ควรเป็น Complete-profile

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { full_name, nickname, phone } = req.body;

  if (!full_name || !nickname || !phone) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
  }

  try {
    // 🔍 หา user_id จากอีเมล
    // **ใช้ supabaseServer ที่ import มา**
    const { data: userData, error: userError } = await supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
      .from("nextauth_users") // ตรวจสอบชื่อตารางให้ถูกต้อง ถ้าเป็น auth.users ก็ใช้ 'auth.users'
      .select("id")
      .eq("email", session.user.email)
      .maybeSingle(); // ✅ ป้องกัน error ถ้าไม่เจอ

    if (userError || !userData?.id) {
      console.error("❌ ไม่พบผู้ใช้", userError);
      return res.status(500).json({ error: "ไม่พบผู้ใช้ในระบบ" });
    }

    const user_id = userData.id;

    // 🔍 เช็คว่ามี profile อยู่หรือยัง
    // **ใช้ supabaseServer ที่ import มา**
    const { data: existingProfile, error: profileError } = await supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
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
      // **ใช้ supabaseServer ที่ import มา**
      const { error: updateError } = await supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
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
      // **ใช้ supabaseServer ที่ import มา**
      const { error: upsertError } = await supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
        .from("user_profiles")
        .upsert({
          user_id,
          full_name,
          nickname,
          phone,
          is_active: true,
          created_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (upsertError) {
        return res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลได้: " + upsertError.message });
      }
    }

    return res.status(200).json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
  } catch (error: any) {
    console.error("Unexpected error in complete-profile API:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
