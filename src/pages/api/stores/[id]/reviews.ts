import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const storeId = req.query.id;

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, anonymous, created_at, users(name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const formatted = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    anonymous: r.anonymous,
    created_at: r.created_at,
    user_name: r.users?.name || null,
  }));

  res.status(200).json({ reviews: formatted });
}
