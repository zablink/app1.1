// pages/api/admin/store-users.ts

import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabaseServer"; // <--- แก้ไขตรงนี้: import supabaseServer
import { getServerSession } from "next-auth"; // ใช้ getServerSession จาก next-auth
import { authOptions } from "../auth/[...nextauth]"; // ตรวจสอบ path ให้ถูกต้อง
import { Session } from "next-auth"; // Import Session type (ถ้าจำเป็น)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ตรวจสอบ session และ role ของ user
  const session = await getServerSession(req, res, authOptions);

  // ตรวจสอบว่ามี session และ role เป็น admin หรือไม่
  if (!session || !(session as Session).user?.role || (session as Session).user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  try {
    // ดึงข้อมูลผู้ใช้ที่มี role เป็น "store"
    // **ใช้ supabaseServer ที่ import มา**
    const { data, error } = await supabaseServer // <--- เปลี่ยนจาก supabase เป็น supabaseServer
      .from("users") // สมมติว่าคุณมีตาราง 'users' ที่เก็บ role
      .select("id, email")
      .eq("role", "store"); // กรองเฉพาะ role ที่เป็น 'store'

    if (error) {
      console.error("Error fetching store users:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ users: data });
  } catch (error: any) {
    console.error("Unexpected error in store-users API:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
