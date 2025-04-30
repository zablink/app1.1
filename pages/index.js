import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

export default function Home() {
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    if (userLocation) {
      const fetchStores = async () => {
        const { data } = await supabase.from('stores').select('*');
        const filteredStores = await Promise.all(
          data.map(async (store) => {
            const res = await fetch(
              `/api/distance?origin=${userLocation.lat},${userLocation.lng}&destination=${store.location.lat},${store.location.lng}`
            );
            const distance = await res.json();
            return { ...store, distance: distance.value / 1000 }; // km
          })
        );
        setStores(
          filteredStores
            .filter((store) => store.distance <= 5)
            .sort((a, b) => a.distance - b.distance)
        );
      };
      fetchStores();
    }
  }, [userLocation]);

  return (
    <div>
      {stores.map((store) => (
        <div key={store.id}>
          {store.name} ({store.distance} km)
        </div>
      ))}
    </div>
  );
}