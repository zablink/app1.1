// src/lib/supabaseServer.ts

import { createClient } from "@supabase/supabase-js";

// **สำหรับฝั่ง Server-side (API Routes, getServerSideProps, etc.)**
// Client นี้จะใช้ตัวแปรสภาพแวดล้อมที่ไม่มี NEXT_PUBLIC_
// และใช้ SUPABASE_SECRET_KEY (service_role key) เพื่อสิทธิ์ที่สูงกว่า
export const supabaseServer = createClient( // <--- เปลี่ยนชื่อ export เป็น supabaseServer เพื่อไม่ให้ชนกับ Client-side
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY! // ต้องเป็น SERVICE_ROLE_KEY
);
