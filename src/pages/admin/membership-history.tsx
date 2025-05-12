import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function MembershipHistoryPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/membership-history")
      .then(res => res.json())
      .then(data => {
        if (data.history) setLogs(data.history);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>ประวัติการเปลี่ยนแพ็กเกจ</h1>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ร้านค้า (User ID)</th>
            <th>จาก</th>
            <th>เป็น</th>
            <th>เปลี่ยนโดย</th>
            <th>เมื่อ</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.user_id}</td>
              <td>{log.from_type}</td>
              <td>{log.to_type}</td>
              <td>{log.changed_by_admin_id}</td>
              <td>{new Date(log.changed_at).toLocaleString("th-TH")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
