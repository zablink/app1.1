// pages/index.tsx
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getNearbyStores } from "@/lib/stores";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [provinceStores, setProvinceStores] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.provider && session.user.isNewUser) {
      router.push("/complete-profile");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);

        try {
          const nearby = await getNearbyStores(latitude, longitude);
          setStores(nearby?.length > 0 ? nearby : dummyStores);
        } catch (err) {
          console.error("Error loading stores:", err);
          setStores(dummyStores);
        }
      },
      () => {
        setLocationError(true);
        setStores(dummyStores);
      }
    );
  }, []);

  const handleProvinceSelect = async () => {
    if (selectedProvince) {
      const res = await fetch(`/api/stores/by-province-name?province=${selectedProvince}`);
      const data = await res.json();
      setProvinceStores(data);
    }
  };

  return (
    <div className="min-h-screen bg-neutral px-4 py-8 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-primary">ร้านอาหารใกล้คุณ</h1>

        {locationError && (
          <p className="text-red-600">ไม่สามารถเข้าถึงตำแหน่งของคุณได้</p>
        )}

        {stores.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse spac
