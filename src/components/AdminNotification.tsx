import { useEffect, useState } from "react";
import { MembershipHistory } from "@/types/membership";

export default function AdminNotification() {
  const [history, setHistory] = useState<MembershipHistory[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/admin/membership-history");
        const json = await res.json();
        setHistory(json.history || []);
      } catch (err) {
        console.error("Failed to fetch membership history", err);
      }
    };

    fetchHistory();
  }, []);

  if (!history.length) return null;

  return (
    <div className="bg-yellow-100 text-yellow-800 p-4 rounded shadow mb-4">
      <h2 className="font-semibold mb-2">การเปลี่ยนแพ็กเกจล่าสุด:</h2>
      <ul className="space-y-1 text-sm">
        {history.slice(0, 5).map((entry) => (
          <li key={entry.id}>
            <span className="font-medium">{entry.users?.email}</span>{" "}
            เปลี่ยนจาก <b>{entry.from_type}</b> เป็น <b>{entry.to_type}</b>{" "}
            เมื่อ {new Date(entry.changed_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
