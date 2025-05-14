'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UpgradeClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'user') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  const handleUpgrade = async () => {
    if (!session?.user.email) return;

    const { error } = await supabase
      .from('users')
      .update({ role: 'store' })
      .eq('email', session.user.email);

    if (error) {
      setMessage('มีข้อผิดพลาดในการอัปเกรด');
    } else {
      setMessage('อัปเกรดเป็นร้านค้าเรียบร้อย! ออกจากระบบแล้ว login ใหม่');
      await router.push('/logout');
    }
  };

  if (status === 'loading') {
    return <p>กำลังโหลดข้อมูลผู้ใช้...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">อัปเกรดเป็นร้านค้า</h1>
      <p className="mb-4">
        คุณสามารถอัปเกรดบัญชี enduser ของคุณเป็นร้านค้าได้ที่นี่
      </p>

      <button
        onClick={handleUpgrade}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        อัปเกรดเป็นร้านค้า
      </button>

      {message && <p className="mt-4 text-blue-600">{message}</p>}
    </div>
  );
}
