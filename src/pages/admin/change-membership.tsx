import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminChangeMembership() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedType, setSelectedType] = useState("free");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // ดึงรายชื่อร้านค้า
    fetch("/api/admin/store-users").then(res => res.json()).then(data => {
      setUsers(data.users || []);
    });
  }, []);

  const handleSubmit = async () => {
    const res = await fetch("/api/admin/change-membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser, toType: selectedType }),
    });
    const result = await res.json();
    setMessage(result.message || result.error);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>เปลี่ยนสถานะสมาชิกของร้านค้า</h1>

      <label>
        เลือกร้านค้า:
        <select onChange={e => setSelectedUser(e.target.value)} value={selectedUser}>
          <option value="">-- เลือก --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </label>

      <label style={{ marginLeft: 16 }}>
        เลือกแพ็กเกจ:
        <select onChange={e => setSelectedType(e.target.value)} value={selectedType}>
          <option value="free">ฟรี</option>
          <option value="pro1">โปร 1</option>
          <option value="pro2">โปร 2</option>
          <option value="pro3">โปร 3</option>
          <option value="special">พิเศษ</option>
        </select>
      </label>

      <button onClick={handleSubmit} style={{ marginLeft: 16 }}>เปลี่ยนแพ็กเกจ</button>

      <p style={{ marginTop: 20 }}>{message}</p>
    </div>
  );
}
