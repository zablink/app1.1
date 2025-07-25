// pages/api/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { createClient } from '@/lib/supabase';

// ตั้งค่า Nodemailer transporter (ควรใช้บริการส่งอีเมลจริงใน Production)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // เช่น smtp.gmail.com
  port: parseInt(process.env.EMAIL_PORT || '587'), // เช่น 587 หรือ 465
  secure: process.env.EMAIL_SECURE === 'true', // true สำหรับ 465, false สำหรับ 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, otp, userId } = req.body; // รับ userId มาด้วย

  if (!email || !otp || !userId) {
    return res.status(400).json({ message: 'Email, OTP, and UserId are required.' });
  }

  const supabase = createClient();

  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // OTP หมดอายุใน 5 นาที, แปลงเป็น ISO String

    // **บันทึกหรืออัปเดต OTP ลงในฐานข้อมูล Supabase**
    // 1. ตรวจสอบว่ามี OTP ที่ยังไม่ถูกใช้สำหรับ user นี้อยู่หรือไม่
    const { data: existingActiveOtp, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_used', false)
      .maybeSingle(); // ใช้ maybeSingle เพราะอาจจะไม่มี

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 คือ Record not found
      throw fetchError;
    }

    if (existingActiveOtp) {
      // หากมี OTP ที่ยังไม่ถูกใช้ ให้ตั้งค่าเป็นใช้แล้ว (หมดอายุ) ก่อนสร้างใหม่
      const { error: updateOldOtpError } = await supabase
        .from('otp_codes')
        .update({ is_used: true })
        .eq('id', existingActiveOtp.id);

      if (updateOldOtpError) throw updateOldOtpError;
    }

    // 2. แทรก OTP ใหม่
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert([{ user_id: userId, email, otp_code: otp, expires_at: expiresAt }]);

    if (insertError) throw insertError;

    // 3. ส่งอีเมล
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'รหัส OTP สำหรับการยืนยันบัญชีของคุณ',
      html: `
        <p>สวัสดีครับ/ค่ะ</p>
        <p>รหัส OTP ของคุณคือ: <strong>${otp}</strong></p>
        <p>รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p>หากคุณไม่ได้ร้องขอรหัสนี้ โปรดละเว้นอีเมลนี้</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent and saved successfully.' });
  } catch (error: any) {
    console.error('Error sending OTP or saving to DB:', error.message);
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
}