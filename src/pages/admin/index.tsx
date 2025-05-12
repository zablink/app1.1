import Link from "next/link";

export default function AdminDashboard() {
  const menus = [
    { href: "/admin/change-membership", label: "เปลี่ยนแพ็กเกจร้านค้า" },
    { href: "/admin/membership-history", label: "ประวัติการเปลี่ยนแพ็กเกจ" },
    { href: "/admin/reported-reviews", label: "รีวิวที่ถูกรายงาน" },
    { href: "/admin/notifications", label: "การแจ้งเตือน" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4">
        {menus.map((menu) => (
          <Link key={menu.href} href={menu.href}>
            <div className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer transition">
              {menu.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
