// components/StoreMembership.tsx
"use client";
//import { useSession } from "next-auth/react";
import { useSession } from '@auth/nextjs';
import { useState, useEffect } from "react";

const membershipOptions = [
  { key: "free", label: "แบบฟรี" },
  { key: "pro1", label: "โปร 1" },
  { key: "pro2", label: "โปร 2" },
  { key: "pro3", label: "โปร 3" },
];

export default function StoreMembership() {
  const { data: session, status } = useSession();
  const [selected, setSelected] = useState<string>("free");

  useEffect(() => {
    if (session?.user?.membershipType) {
      setSelected(session.user.membershipType);
    }
  }, [session]);

  if (status === "loading") return <p>กำลังโหลด...</p>;

  const handleUpgrade = async () => {
    if (!session) return;
    alert(`คุณเลือก: ${selected}\nระบบชำระเงินจะถูกเพิ่มภายหลัง`);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>เปลี่ยนรูปแบบสมาชิกของร้าน</h1>
      <p>สถานะปัจจุบัน: <strong>{session?.user?.membershipType || "free"}</strong></p>

      <div style={{ marginTop: 16 }}>
        {membershipOptions.map(option => (
          <div key={option.key}>
            <label>
              <input
                type="radio"
                value={option.key}
                checked={selected === option.key}
                onChange={() => setSelected(option.key)}
              />
              {option.label}
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleUpgrade} style={{ marginTop: 16 }}>
        ดำเนินการเปลี่ยนแปลง (ยังไม่เชื่อมชำระเงิน)
      </button>
    </div>
  );
}
