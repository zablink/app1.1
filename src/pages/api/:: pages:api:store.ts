// pages/api/store.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Missing or invalid email" });
  }

  const { data, error } = await supabase.from("stores").select("*").eq("email", email).single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ store: data });
}
