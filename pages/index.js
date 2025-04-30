import { useSession } from 'next-auth/react';
import supabase from '../lib/supabase';
import { useEffect, useState } from 'react';
import Chart from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function StoreDashboard() {
  const { data: session } = useSession();
  const [store, setStore] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [stats, setStats] = useState({ views: 0, clicks: 0 });

  // ดึงข้อมูลร้านค้า
  useEffect(() => {
    if (session) {
      const fetchStore = async () => {
        const { data } = await supabase
          .from('stores')
          .select('*, subdistricts(id, name)')
          .eq('user_id', session.user.id)
          .single();
        setStore(data);
        setSelectedSubdistrict(data.subdistrict_id || '');
      };
      fetchStore();
    }
  }, [session]);

  // ดึง stats
  useEffect(() => {
    if (session) {
      const fetchStats = async () => {
        const { data } = await supabase
          .from('stats')
          .select('views, clicks')
          .eq('store_id', store?.id)
          .single();
        setStats(data || { views: 0, clicks: 0 });
      };
      fetchStats();
    }
  }, [store]);

  // ดึงจังหวัด
  useEffect(() => {
    const fetchProvinces = async () => {
      const { data } = await supabase.from('provinces').select('id, name');
      setProvinces(data);
    };
    fetchProvinces();
  }, []);

  // ดึงอำเภอ
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        const { data } = await supabase
          .from('districts')
          .select('id, name')
          .eq('province_id', selectedProvince);
        setDistricts(data);
        setSelectedDistrict('');
        setSubdistricts([]);
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  // ดึงตำบล
  useEffect(() => {
    if (selectedDistrict) {
      const fetchSubdistricts = async () => {
        const { data } = await supabase
          .from('subdistricts')
          .select('id, name')
          .eq('district_id', selectedDistrict);
        setSubdistricts(data);
      };
      fetchSubdistricts();
    }
  }, [selectedDistrict]);

  // อัปเดตตำแหน่งร้านค้า
  const handleUpdateLocation = async () => {
    if (selectedSubdistrict) {
      await supabase
        .from('stores')
        .update({ subdistrict_id: selectedSubdistrict })
        .eq('id', store.id);
      alert('อัปเดตตำแหน่งเรียบร้อย');
    }
  };

  if (!session) return <p>กรุณาเข้าสู่ระบบ</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Store Dashboard</h1>

      {/* แสดง stats */}
      <div className="mb-4">
        <h2 className="text-xl">สถิติ</h2>
        <Chart
          type="bar"
          data={{
            labels: ['Views', 'Clicks'],
            datasets: [{ label: 'Stats', data: [stats.views, stats.clicks], backgroundColor: '#3b82f6' }],
          }}
        />
      </div>

      {/* อัปเดตตำแหน่ง */}
      <div className="mb-4">
        <h2 className="text-xl">ตำแหน่งร้านค้า</h2>
        <div className="mb-2">
          <label className="block mb-1">จังหวัด</label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">เลือกจังหวัด</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">อำเภอ</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="p-2 border rounded"
            disabled={!selectedProvince}
          >
            <option value="">เลือกอำเภอ</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">ตำบล</label>
          <select
            value={selectedSubdistrict}
            onChange={(e) => setSelectedSubdistrict(e.target.value)}
            className="p-2 border rounded"
            disabled={!selectedDistrict}
          >
            <option value="">เลือกตำบล</option>
            {subdistricts.map((subdistrict) => (
              <option key={subdistrict.id} value={subdistrict.id}>
                {subdistrict.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleUpdateLocation}
          className="p-2 bg-blue-500 text-white rounded"
          disabled={!selectedSubdistrict}
        >
          อัปเดตตำแหน่ง
        </button>
      </div>
    </div>
  );
}