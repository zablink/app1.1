// src/pages/dashboard/index.tsx

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import Layout from '@/components/Layout'; // สมมติคุณมี layout เดิม
import Header from '@/components/Header'; // สมมติมี header

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { data: shops, error } = useSWR(session ? '/api/shops/favorites' : null, fetcher);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  if (status === 'loading') return <div>Loading session...</div>;
  if (!session) return <div>กรุณาเข้าสู่ระบบ</div>;
  if (error) return <div>เกิดข้อผิดพลาด</div>;
  if (!shops) return <div>Loading shops...</div>;

  const handleUpgrade = async (shopId: number) => {
    setLoadingId(shopId);
    try {
      await fetch(`/api/shops/${shopId}/upgrade`, { method: 'POST' });
      mutate('/api/shops/favorites');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleBuyAds = (shopId: number) => {
    window.location.href = `/ads/package?shopId=${shopId}`;
  };

  return (
    <Layout>
      <Header user={session.user} />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map(shop => (
          <div key={shop.id} className="bg-white shadow-md p-4 rounded-xl">
            <h2 className="text-xl font-bold">{shop.name}</h2>
            <p className="text-gray-500 text-sm">เข้าชม: {shop.views}</p>
            <p className="text-gray-500 text-sm">กดลิงก์: {shop.linkClicks}</p>
            <p className="text-gray-500 text-sm">Role Level: {shop.roleLevel}</p>

            <div className="mt-4 flex gap-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                onClick={() => handleUpgrade(shop.id)}
                disabled={loadingId === shop.id || shop.roleLevel >= 3}
              >
                {loadingId === shop.id ? 'กำลังอัปเกรด...' : 'Upgrade Role'}
              </button>

              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleBuyAds(shop.id)}
              >
                ซื้อโฆษณา
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
