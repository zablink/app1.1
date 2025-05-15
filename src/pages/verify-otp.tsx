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

// pages/complete-profile.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function CompleteProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        nickname,
        phone,
        avatar_url: '',
        is_active: true
      })
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/');
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">กรอกข้อมูลเพิ่มเติม</h1>
      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ชื่อ-นามสกุล" className="mb-2 p-2 border rounded" />
      <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="ชื่อเล่น" className="mb-2 p-2 border rounded" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เบอร์โทรศัพท์" className="mb-2 p-2 border rounded" />
      <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
        บันทึก
      </button>
      {message && <p className="text-red-500 mt-2">{message}</p>}
    </div>
  );
}
