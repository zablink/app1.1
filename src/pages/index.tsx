// pages/index.tsx
import { useEffect, useState } from 'react';
import { getNearestSubdistrict } from '@/lib/nearby';

export default function HomePage() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [nearest, setNearest] = useState<any>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = pos.coords;
        setLocation(coords);

        const nearestSubdistrict = await getNearestSubdistrict({
          lat: coords.latitude,
          lng: coords.longitude,
        });

        setNearest(nearestSubdistrict);
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">ตำบลใกล้เคียงที่สุด</h1>

      {location && (
        <p>
          พิกัดของคุณ: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </p>
      )}

      {nearest ? (
        <div className="mt-4">
          <p>
            <strong>ตำบล:</strong> {nearest.name}
          </p>
          <p>
            <strong>อำเภอ:</strong> {nearest.districts.name}
          </p>
        </div>
      ) : (
        <p className="mt-4">กำลังค้นหาตำบลใกล้เคียง...</p>
      )}
    </main>
  );
}
