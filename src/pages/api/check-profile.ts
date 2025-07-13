// pages/api/check-profile.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // ตรวจสอบ path ให้ถูกต้อง
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  console.log("Check-profile before check Session");

  if (!session || !session.user) {
    return res.status(401).json({ isComplete: false });
  }

  try {
    // **ใช้ supabaseServer ที่ import มา**
    const { data: profile, error } = await supabaseServer
      .from("user_profiles") // ตรวจสอบชื่อตารางให้ถูกต้อง
      .select("is_active")
      .eq("user_id", session.user.id)
      .single();

    console.log("✅ API check-profile called");
    console.log("Session:", session);
    console.log("User ID:", session?.user?.id);
    console.log("Profile data:", profile);
    console.log("Error:", error);

    if (error) {
      console.error("Error fetching user profile:", error.message);
      // หากเกิด error เช่นไม่พบข้อมูล (PGRST116) อาจจะถือว่า profile ไม่สมบูรณ์
      // หรือหากเป็น error อื่นๆ ที่ร้ายแรงกว่า
      return res.status(500).json({ isComplete: false, error: error.message });
    }

    const isComplete = profile?.is_active === true;

    console.log("isComplete:", isComplete);

    return res.status(200).json({ isComplete });
  } catch (error: any) {
    console.error("Unexpected error in check-profile API:", error.message);
    return res.status(500).json({ isComplete: false, error: "Internal Server Error" });
  }
}
