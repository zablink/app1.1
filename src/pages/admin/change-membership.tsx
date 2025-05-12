import { useEffect, useState } from "react";
//import { MembershipHistory } from "@/types/membership";
import { User } from "@/types/user";

export default function ChangeMembership() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        setUsers(json.users || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, []);

  const handleChangeMembership = async (userId: string, newType: string) => {
    try {
      await fetch("/api/stores/change-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, toType: newType }),
      });
      alert("เปลี่ยนสถานะสำเร็จ");
    } catch (err) {
      console.error("Error changing membership", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">เปลี่ยนแพ็กเกจสมาชิก</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border space-x-2">
                {["free", "pro1", "pro2", "pro3", "special"].map((type) => (
                  <button
                    key={type}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    onClick={() => handleChangeMembership(user.id, type)}
                  >
                    {type}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
