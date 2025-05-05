// pages/api/admin/reported-reviews/action.ts
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.role !== "admin")
    return res.status(403).json({ error: "Admin only" });

  const { review_id, action } = req.body;
  if (!review_id || !["delete", "ignore"].includes(action))
    return res.status(400).json({ error: "Invalid input" });

  // ดึงผู้แจ้งก่อน
  const { data: reporters, error: fetchError } = await supabase
    .from("review_reports")
    .select("user_id")
    .eq("review_id", review_id);

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  // ถ้าเลือก "delete" → ลบรีวิว
  if (action === "delete") {
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", review_id);

    if (deleteError) return res.status(500).json({ error: deleteError.message });
  }

  // ลบรายงานที่เกี่ยวข้อง ไม่ว่าจะ delete หรือ ignore
  await supabase.from("review_reports").delete().eq("review_id", review_id);

  // ส่งแจ้งเตือนกลับ (สมมุติว่าเก็บ email หรือ notification ไว้)
  for (const reporter of reporters) {
    // TODO: ส่ง email หรือบันทึก notification (ถ้ามีระบบแจ้งเตือน)
    console.log(`แจ้งผู้ใช้ ${reporter.user_id} ว่ารีวิวได้ถูก "${action === "delete" ? "ลบ" : "ปล่อยผ่าน"}"`);
  }

  return res.status(200).json({ message: `ดำเนินการ ${action === "delete" ? "ลบรีวิว" : "ปล่อยผ่าน"} สำเร็จ` });
}
