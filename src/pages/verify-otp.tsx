// pages/verify-otp.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { email } = router.query;

  const handleVerify = async () => {
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/complete-profile');
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">ยืนยัน OTP</h1>
      <h3>ตรวจสอบที่ Email ที่ลงทะเบียน</h3>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="กรอกรหัส 6 หลัก"
        className="mt-4 p-2 border rounded"
      />
      <button onClick={handleVerify} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        ยืนยัน
      </button>
      {message && <p className="text-red-500 mt-2">{message}</p>}
    </div>
  );
}