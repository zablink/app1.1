import { supabase } from "@/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid store ID" });
  }

  if (method === "GET") {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        user_profiles(nickname),
        users(email)
      `)
      .eq("store_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ reviews: data });
  }

  if (method === "POST") {
    const { rating, comment, isAnonymous } = req.body;

    const { user } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          store_id: id,
          rating,
          comment,
          is_anonymous: isAnonymous,
          user_id: user.id,
        },
      ])
      .select(`
        *,
        user_profiles(nickname),
        users(email)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ review: data });
  }

  return res.setHeader("Allow", ["GET", "POST"]).status(405).end(`Method ${method} Not Allowed`);
}
