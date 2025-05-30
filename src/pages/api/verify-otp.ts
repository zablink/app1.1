// pages/api/verify-otp.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, otp } = req.body;

  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return res.status(400).json({ error: 'OTP ไม่ถูกต้อง' });
  }

  const now = new Date();
  if (new Date(data.expires_at) < now) {
    return res.status(400).json({ error: 'OTP หมดอายุแล้ว' });
  }

  // ✅ OTP ถูกต้อง
  await supabase.from('otps').delete().eq('id', data.id); // ลบ OTP นี้

  res.status(200).json({ success: true });
}
