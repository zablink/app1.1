import { useSession } from "next-auth/react";
import { useState } from "react";

const membershipOptions = [
  { key: "free", label: "แบบฟรี" },
  { key: "pro1", label: "โปร 1" },
  { key: "pro2", label: "โปร 2" },
  { key: "pro3", label: "โปร 3" },
];

export default function MembershipPage() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<string>(session?.user?.membershipType || "free");

  const handleUpgrade = async () => {
    if (!session) return;
    // TODO: call API upgrade
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
