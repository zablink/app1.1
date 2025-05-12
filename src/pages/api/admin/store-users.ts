import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email")
    .eq("role", "store");

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ users: data });
}
