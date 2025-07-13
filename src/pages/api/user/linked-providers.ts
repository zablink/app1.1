// pages/api/user/linked-providers.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json([]);

  const spRes = await fetch(`${supabaseUrl}/rest/v1/nextauth_accounts?select=provider&userId=eq.${session.user.id}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  const data = await spRes.json();
  const providers = data.map((row: any) => row.provider);

  res.status(200).json(providers);
}
