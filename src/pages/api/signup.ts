// ✅ Signup with OTP and Rate Limit Protection
// pages/api/signup.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from '@/utils/rate-limit';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  try {
    await limiter.check(res, 5, ip as string); // max 5 req/min per IP
  } catch {
    return res.status(429).json({ error: 'คุณส่งคำขอถี่เกินไป กรุณารอสักครู่' });
  }

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  // สมัครผู้ใช้ใน Supabase
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false
  });
  if (signUpError) return res.status(400).json({ error: signUpError.message });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await supabase.from('otps').insert({
    email,
    otp,
    expires_at: new Date(Date.now() + 5 * 60 * 1000)
  });

  // ส่ง OTP ทางอีเมล
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject: 'OTP สำหรับยืนยันอีเมล',
    html: `<p>รหัส OTP ของคุณคือ: <strong>${otp}</strong></p>`
  });

  return res.status(200).json({ success: true });
}
