// pages/api/send-otp.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // สร้าง OTP 6 หลัก

  // บันทึก OTP ลง Supabase
  await supabase.from('otps').insert({
    email,
    otp,
    expires_at: new Date(Date.now() + 5 * 60 * 1000) // หมดอายุใน 5 นาที
  });

  // ส่งอีเมล
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
    subject: 'รหัส OTP ของคุณ',
    text: `รหัส OTP ของคุณคือ: ${otp}`,
    html: `<p>รหัส OTP ของคุณคือ: <strong>${otp}</strong></p>`
  });

  res.status(200).json({ success: true });
}
