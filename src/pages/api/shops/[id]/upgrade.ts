// /pages/api/shops/[id]/upgrade.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const shop = await prisma.shop.findUnique({ where: { id: Number(id) } });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    if (shop.roleLevel >= 3) return res.status(400).json({ message: 'ไม่สามารถ upgrade ได้อีก' });

    const updatedShop = await prisma.shop.update({
      where: { id: Number(id) },
      data: { roleLevel: shop.roleLevel + 1 },
    });

    res.status(200).json(updatedShop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
}
