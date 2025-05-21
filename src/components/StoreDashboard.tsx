// components/StoreDashboard.tsx

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

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
    lat: null,
    lng: null,
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchStore();
    }
  }, [session]);

  const fetchStore = async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_email", session?.user?.email)
      .single();
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
    setLoading(false);
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
    await supabase.from("stores").update({
      ...formData,
    }).eq("id", store.id);
    fetchStore();
  };

  if (!session) return <div className="p-4">กรุณาเข้าสู่ระบบ</div>;
  if (loading) return <div className="p-4">กำลังโหลดข้อมูลร้านค้า...</div>;

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
