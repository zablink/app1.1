import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { toType } = req.body;

  // ตรวจสอบสิทธิ์
  if (session.user.role !== "store") {
    return res.status(403).json({ error: "Only store accounts allowed" });
  }

  const userId = session.user.email; // หรือ ID ที่ผูกกับ session

  // TODO: query ข้อมูลเดิม แล้วบันทึกการเปลี่ยนแปลง พร้อมอัปเดต
  // สำหรับตอนนี้แค่ response กลับ
  return res.status(200).json({ message: `จะเปลี่ยนเป็น ${toType} โดยยังไม่คิดเงิน` });
}
