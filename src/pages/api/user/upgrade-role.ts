// src/pages/api/user/upgrade-role.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId, newRole } = req.body;

    // ตรวจสอบว่าเป็นการอัพเกรด role ของตัวเอง
    if (userId !== session.user.id) {
      return res.status(403).json({ message: 'Can only upgrade your own role' });
    }

    // ตรวจสอบ role ปัจจุบัน
    if (session.user.role !== 'user') {
      return res.status(400).json({ message: 'Already upgraded or admin account' });
    }

    // ตรวจสอบ newRole ที่อนุญาต
    if (!['shop'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role upgrade' });
    }

    // อัพเดต role ใน database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Role upgrade error:', error);
      return res.status(500).json({ message: 'Database error' });
    }

    // Log การเปลี่ยนแปลง
    await supabase.from('admin_logs').insert({
      admin_id: userId, // ในกรณีนี้คือการเปลี่ยนแปลงของตัวเอง
      action: 'role_upgrade',
      target_type: 'user',
      target_id: userId,
      details: {
        from_role: 'user',
        to_role: newRole,
        self_upgrade: true
      },
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    // สร้าง notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'role_upgrade',
      title: 'อัพเกรดบัญชีสำเร็จ',
      message: `คุณได้อัพเกรดเป็น${newRole === 'shop' ? 'เจ้าของร้านค้า' : newRole}แล้ว`,
      action_url: newRole === 'shop' ? '/shops/create' : '/dashboard'
    });

    return res.status(200).json({
      message: 'Role upgraded successfully',
      newRole: data.role,
      redirectUrl: newRole === 'shop' ? '/shops/setup' : '/dashboard'
    });

  } catch (error) {
    console.error('Role upgrade API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}