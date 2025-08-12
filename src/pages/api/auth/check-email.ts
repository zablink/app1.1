// src/pages/api/auth/check-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    // ใช้ function ที่สร้างไว้ใน database
    const { data: providers, error } = await supabase
      .rpc('check_email_providers', { email_to_check: email });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Database error' });
    }

    // ส่งกลับข้อมูล providers ที่พบ
    return res.status(200).json({
      email,
      providers: providers || [],
      hasExistingAccount: (providers && providers.length > 0),
    });

  } catch (error) {
    console.error('Check email error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}