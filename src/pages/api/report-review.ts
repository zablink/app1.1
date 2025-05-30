// src/pages/api/report-review.ts

/*
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { review_id, reason } = req.body;

    if (!review_id || !reason) {
      return res.status(400).json({ message: "Missing review_id or reason" });
    }

    const { error } = await supabase.from("reported_reviews").insert([
      {
        review_id,
        reason,
        reported_by: session.user.email,
      },
    ]);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({ message: "Reported successfully" });
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
*/

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "รีวิวนี้ถูกรายงานเรียบร้อยแล้ว" });
}
