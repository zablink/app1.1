// pages/api/report-review.ts
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  const { review_id } = req.body;
  if (!review_id) return res.status(400).json({ error: "review_id is required" });

  const { data, error } = await supabase
    .from("review_reports")
    .insert([{ review_id, user_id: session.user.id }]);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ message: "แจ้งรีวิวเรียบร้อยแล้ว" });
}
