// components/StoreDashboard.tsx

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // สำหรับ NextAuth session
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase"; // <--- แก้ไขตรงนี้: import createClient (ฟังก์ชัน) แทน supabase

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function StoreDashboard() {
  const { data: session } = useSession();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    links: [""],
    is_location_public: false,
    lat: null as number | null, // กำหนด type ให้ชัดเจน
    lng: null as number | null, // กำหนด type ให้ชัดเจน
  });

  // **สร้าง Supabase client instance ภายใน Component**
  // เพื่อให้แน่ใจว่ามันถูกสร้างเมื่อรันบน Client-side และใช้ตัวแปร NEXT_PUBLIC_
  const supabase = createClient(); // <--- เรียกใช้ createClient() เพื่อรับ instance

  useEffect(() => {
    // ตรวจสอบ session.user.id แทน email เพื่อให้สอดคล้องกับ type ที่เราขยายไว้
    if (session?.user?.id) {
      fetchStore();
    }
  }, [session, supabase]); // เพิ่ม supabase ใน dependency array เพื่อให้ useEffect re-run เมื่อ client พร้อม

  const fetchStore = async () => {
    setLoading(true);
    try {
      // ตรวจสอบ session อีกครั้งภายใน async function เพื่อความปลอดภัย
      if (!session?.user?.id) {
        // อาจจะ redirect หรือแสดง error
        console.error("No user ID found in session.");
        setLoading(false);
        return;
      }

      // ใช้ session.user.id แทน owner_email (ถ้าตาราง stores ผูกกับ user id)
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", session.user.id) // สมมติว่าฟิลด์เป็น owner_id และผูกกับ user.id
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setStore(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          links: data.links || [""],
          is_location_public: data.is_location_public,
          lat: data.lat,
          lng: data.lng,
        });
      }
    } catch (err: any) {
      console.error("Error fetching store data:", err.message);
      // แสดงข้อผิดพลาดให้ผู้ใช้เห็น
      alert(`Error loading store data: ${err.message}`); // ควรใช้ Modal/Toast
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    setFormData({ ...formData, links: newLinks });
  };

  const addLink = () => {
    setFormData({ ...formData, links: [...formData.links, ""] });
  };

  const saveChanges = async () => {
    try {
      const { error } = await supabase.from("stores").update({
        ...formData,
      }).eq("id", store.id); // ใช้ store.id เพื่ออัปเดตข้อมูลร้านค้าที่ถูกต้อง

      if (error) {
        throw new Error(error.message);
      }
      alert("บันทึกข้อมูลสำเร็จ!"); // ควรใช้ Modal/Toast
      fetchStore(); // ดึงข้อมูลล่าสุดหลังจากบันทึก
    } catch (err: any) {
      console.error("Error saving changes:", err.message);
      alert(`Error saving changes: ${err.message}`); // ควรใช้ Modal/Toast
    }
  };

  if (!session) return <div className="p-4">กรุณาเข้าสู่ระบบ</div>;
  if (loading) return <div className="p-4">กำลังโหลดข้อมูลร้านค้า...</div>;
  if (!store) return <div className="p-4">ไม่พบข้อมูลร้านค้า กรุณาติดต่อผู้ดูแลระบบ</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label>ชื่อร้านค้า</Label>
            <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div>
            <Label>รายละเอียดร้าน</Label>
            <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>ลิงก์ไปยัง food delivery</Label>
            {formData.links.map((link, i) => (
              <Input
                key={i}
                value={link}
                onChange={(e) => handleLinkChange(i, e.target.value)}
                placeholder={`ลิงก์ที่ ${i + 1}`}
              />
            ))}
            <Button variant="outline" onClick={addLink}>เพิ่มลิงก์</Button>
          </div>
          <div>
            <Label>แสดงพิกัดร้านบนแผนที่</Label>
            <Switch
              checked={formData.is_location_public}
              onCheckedChange={(val) => handleChange("is_location_public", val)}
            />
          </div>
          <div>
            <Label>เลือกพิกัดร้าน</Label>
            <Map
              lat={formData.lat}
              lng={formData.lng}
              onChange={(lat: number, lng: number) => {
                handleChange("lat", lat);
                handleChange("lng", lng);
              }}
            />
          </div>
          <Button onClick={saveChanges}>บันทึกข้อมูล</Button>
        </CardContent>
      </Card>
    </div>
  );
}
