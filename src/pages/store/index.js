import { useSession } from 'next-auth/react';
import supabase from '../../lib/supabase';
import { useEffect, useState } from 'react';
import Chart from 'react-chartjs-2';

export default function StoreDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ views: 0, clicks: 0 });

  useEffect(() => {
    if (session) {
      const fetchStats = async () => {
        const { data } = await supabase
          .from('stats')
          .select('views, clicks')
          .eq('store_id', session.user.id);
        setStats(data[0] || { views: 0, clicks: 0 });
      };
      fetchStats();
    }
  }, [session]);

  return (
    <div className="p-4">
      <h1 className="text-2xl">Store Dashboard</h1>
      <div>
        <h2>Stats</h2>
        <Chart
          type="bar"
          data={{
            labels: ['Views', 'Clicks'],
            datasets: [{ label: 'Stats', data: [stats.views, stats.clicks] }],
          }}
        />
      </div>
    </div>
  );
}