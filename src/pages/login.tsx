// src/pages/login.tsx

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import client-side Supabase
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่แล้วหรือไม่
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/'); // Redirect ไปหน้าหลักถ้าล็อกอินแล้ว
      }
    };
    checkUser();

    // หากมีการ Redirect มาจากหน้ายืนยันอีเมล หรือ error
    if (router.query.message === 'Email_Confirmed_Successfully') {
      setMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
      setIsSuccess(true);
      router.replace('/login', undefined, { shallow: true }); // ลบ query param ออกจาก URL
    } else if (router.query.error) {
        setMessage(`เกิดข้อผิดพลาด: ${router.query.error}`);
        setIsSuccess(false);
        router.replace('/login', undefined, { shallow: true });
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setMessage('เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าหลัก...');
      setIsSuccess(true);
      router.push('/'); // Redirect ไปหน้าหลักหลัง login สำเร็จ

    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.message.includes('Email not confirmed')) {
        setMessage('อีเมลนี้ยังไม่ได้รับการยืนยัน โปรดตรวจสอบอีเมลของคุณ');
      } else {
        setMessage(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${err.message}`);
      }
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-center ${
              isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-6">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-primary hover:underline">
            ลงทะเบียนที่นี่
          </Link>
        </p>
        <p className="text-center text-sm mt-2">
            <Link href="/forgot-password" className="text-primary hover:underline">
                ลืมรหัสผ่าน?
            </Link>
        </p>
      </div>
    </div>
  );
}