// pages/api/admin/reported-reviews/action.ts

import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // แก้ไขตรงนี้: import supabaseServer
import { getServerSession } from "next-auth/next"; // แก้ไขมาใช้ getServerSession จาก next-auth/next
import { authOptions } from "../../auth/[...nextauth]"; // ตรวจสอบ path ให้ถูกต้อง
import { Session } from "next-auth"; // นำเข้า Session จาก next-auth

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ตรวจสอบว่าเป็น POST request
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  // ตรวจสอบ session และ role ของ user
  const session = await getServerSession(req, res, authOptions);
  if (!session || !(session as Session).user?.role || (session as Session).user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const { review_id, action } = req.body;
  if (!review_id || !["delete", "ignore"].includes(action)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // ดึงข้อมูลผู้แจ้งรายงาน
    // ใช้ supabaseServer ที่ import มา
    const { data: reporters, error: fetchError } = await supabaseServer
      .from("review_reports")
      .select("user_id")
      .eq("review_id", review_id);

    if (fetchError) {
      console.error("Error fetching reporters:", fetchError.message);
      return res.status(500).json({ error: fetchError.message });
    }

    // ถ้าเลือก "delete" → ลบรีวิว
    if (action === "delete") {
      // ใช้ supabaseServer ที่ import มา
      const { error: deleteError } = await supabaseServer
        .from("reviews")
        .delete()
        .eq("id", review_id);

      if (deleteError) {
        console.error("Error deleting review:", deleteError.message);
        return res.status(500).json({ error: deleteError.message });
      }
    }

    // ลบรายงานที่เกี่ยวข้อง ไม่ว่าจะ delete หรือ ignore
    // ใช้ supabaseServer ที่ import มา
    const { error: deleteReportsError } = await supabaseServer.from("review_reports").delete().eq("review_id", review_id);

    if (deleteReportsError) {
      console.error("Error deleting review reports:", deleteReportsError.message);
      // อาจจะไม่ต้อง return 500 ถ้าการลบรีวิวสำเร็จแล้ว แต่อาจจะ log ไว้
    }

    // ส่งแจ้งเตือนกลับ (สมมุติว่าเก็บ email หรือ notification ไว้)
    for (const reporter of reporters) {
      // TODO: ส่ง email หรือบันทึก notification (ถ้ามีระบบแจ้งเตือน)
      console.log(`แจ้งผู้ใช้ ${reporter.user_id} ว่ารีวิวได้ถูก "${action === "delete" ? "ลบ" : "ปล่อยผ่าน"}"`);
    }

    return res.status(200).json({ message: `ดำเนินการ ${action === "delete" ? "ลบรีวิว" : "ปล่อยผ่าน"} สำเร็จ` });
  } catch (error: any) {
    console.error("Unexpected error in reported-reviews/action API:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
