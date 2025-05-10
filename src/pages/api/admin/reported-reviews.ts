// pages/api/admin/reported-reviews.ts
import { supabase } from "@/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.role !== "admin")
    return res.status(403).json({ error: "Admin only" });

  const { data, error } = await supabase
    .from("review_reports_view") // อาจใช้ view ที่ join review + user + store แล้ว
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ reports: data });
}
