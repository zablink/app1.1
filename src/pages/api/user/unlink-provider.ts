// pages/api/user/unlink-provider.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  const { provider } = req.body;

  const spRes = await fetch(`${supabaseUrl}/rest/v1/nextauth_accounts?userId=eq.${session.user.id}&provider=eq.${provider}`, {
    method: 'DELETE',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  // ดึง provider ทั้งหมดของ user
  const currentRes = await fetch(`${supabaseUrl}/rest/v1/nextauth_accounts?userId=eq.${session.user.id}&select=provider`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  const accounts = await currentRes.json();

  // ห้ามลบถ้าเหลือแค่ 1
  if (accounts.length <= 1) {
    return res.status(400).json({ error: "ไม่สามารถยกเลิก provider สุดท้ายได้" });
  }


  if (!spRes.ok) return res.status(500).json({ error: "unlink failed" });
  return res.status(200).json({ success: true });
}
