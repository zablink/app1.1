import { useEffect, useState } from "react";
import { MembershipHistory } from "@/types/membership";

export default function MembershipHistoryPage() {
  const [history, setHistory] = useState<MembershipHistory[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/admin/membership-history");
        const json = await res.json();
        setHistory(json.history || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">ประวัติการเปลี่ยนแพ็กเกจ</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">จาก</th>
            <th className="p-2 border">เป็น</th>
            <th className="p-2 border">โดย</th>
            <th className="p-2 border">เมื่อ</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id}>
              <td className="p-2 border">{entry.users?.email}</td>
              <td className="p-2 border">{entry.from_type}</td>
              <td className="p-2 border">{entry.to_type}</td>
              <td className="p-2 border">{entry.changed_by_admin_id}</td>
              <td className="p-2 border">
                {new Date(entry.changed_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
  