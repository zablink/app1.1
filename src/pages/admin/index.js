import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (session?.user?.role === 'super_admin') {
      const fetchStores = async () => {
        const { data } = await supabase.from('stores').select('*');
        setStores(data);
      };
      fetchStores();
    }
  }, [session]);

  return (
    <div className="p-4">
      <h1 className="text-2xl">Admin Dashboard</h1>
      <ul>
        {stores.map((store) => (
          <li key={store.id}>{store.name}</li>
        ))}
      </ul>
    </div>
  );
}