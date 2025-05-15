// pages/api/check-profile.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ isComplete: false });
  }

  const { data: profile, error } = await supabase
    .from("user_profile")
    .select("is_active")
    .eq("user_id", session.user.id)
    .single();

  if (error) {
    return res.status(500).json({ isComplete: false });
  }

  const isComplete = profile?.is_active === true;

  return res.status(200).json({ isComplete });
}
