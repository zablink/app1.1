import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel("public:membership_history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "membership_history" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div>
      <h2>การแจ้งเตือน</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            ร้านค้า {notification.user_id} เปลี่ยนแพ็กเกจเป็น {notification.to_type} เมื่อ {new Date(notification.changed_at).toLocaleString("th-TH")}
          </li>
        ))}
      </ul>
    </div>
  );
}
