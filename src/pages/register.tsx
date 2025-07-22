// src/pages/register.tsx

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import client-side Supabase
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // หากคุณมีหน้าที่จะให้ผู้ใช้ Redirect ไปหลังจากคลิกลิงก์ยืนยันอีเมล
          // ค่านี้จะถูกใช้เป็น `redirectTo` ในลิงก์ยืนยันอีเมลที่ Supabase ส่งไป
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login?message=Email_Confirmed_Successfully`,
        },
      });

      if (error) {
        throw error;
      }

      // Check if user needs email confirmation
      if (data?.user?.identities && data.user.identities.length === 0) {
        // This case indicates that the user already exists, but needs to be confirmed
        setMessage('ผู้ใช้นี้ลงทะเบียนแล้วและอาจรอการยืนยันอีเมล หรือเข้าสู่ระบบได้เลย');
        setIsSuccess(false);
      } else {
        setMessage('ลงทะเบียนสำเร็จ! โปรดตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี');
        setIsSuccess(true);
        // ไม่ต้อง redirect ทันที ให้ผู้ใช้ไปเช็คอีเมล
      }

    } catch (err: any) {
      if (err.message.includes('User already registered')) {
        setMessage('อีเมลนี้ลงทะเบียนแล้ว โปรดเข้าสู่ระบบ หรือลองใช้อีเมลอื่น');
      } else if (err.message.includes('Password should be at least 6 characters')) {
        setMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else {
        setMessage(`เกิดข้อผิดพลาดในการลงทะเบียน: ${err.message}`);
      }
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">สร้างบัญชีใหม่</h2>

        <form onSubmit={handleRegister} className="space-y-4">
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'กำลังดำเนินการ...' : 'ลงทะเบียน'}
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
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-primary hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
}