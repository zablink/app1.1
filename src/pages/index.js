import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export default function Home() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [stores, setStores] = useState([]);

  // ดึงจังหวัด
  useEffect(() => {
    const fetchProvinces = async () => {
      const { data, error } = await supabase.from('provinces').select('id, name');
      if (error) console.error('Error fetching provinces:', error);
      else setProvinces(data);
    };
    fetchProvinces();
  }, []);

  // ดึงอำเภอเมื่อเลือกจังหวัด
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        const { data, error } = await supabase
          .from('districts')
          .select('id, name')
          .eq('province_id', selectedProvince);
        if (error) console.error('Error fetching districts:', error);
        else {
          setDistricts(data);
          setSelectedDistrict('');
          setSubdistricts([]);
          setSelectedSubdistrict('');
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  // ดึงตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    if (selectedDistrict) {
      const fetchSubdistricts = async () => {
        const { data, error } = await supabase
          .from('subdistricts')
          .select('id, name')
          .eq('district_id', selectedDistrict);
        if (error) console.error('Error fetching subdistricts:', error);
        else {
          setSubdistricts(data);
          setSelectedSubdistrict('');
        }
      };
      fetchSubdistricts();
    }
  }, [selectedDistrict]);

  // ดึงร้านค้าตามตำบล/อำเภอ/จังหวัด/ภาค
  useEffect(() => {
    const fetchStores = async () => {
      let data = [];

      if (selectedSubdistrict) {
        // 1. ค้นหาตามตำบล
        const { data: subdistrictStores } = await supabase
          .from('stores')
          .select('*, subdistricts!inner(name)')
          .eq('subdistrict_id', selectedSubdistrict);
        if (subdistrictStores?.length > 0) {
          data = subdistrictStores;
        } else {
          // 2. ถ้าไม่มีในตำบล ค้นหาตามอำเภอ
          const { data: districtStores } = await supabase
            .from('stores')
            .select('*, subdistricts!inner(district_id)')
            .eq('subdistricts.district_id', selectedDistrict);
          if (districtStores?.length > 0) {
            data = districtStores;
          } else {
            // 3. ถ้าไม่มีในอำเภอ ค้นหาตามจังหวัด
            const { data: provinceStores } = await supabase
              .from('stores')
              .select('*, subdistricts!inner(districts!inner(province_id))')
              .eq('subdistricts.districts.province_id', selectedProvince);
            if (provinceStores?.length > 0) {
              data = provinceStores;
            } else {
              // 4. ถ้าไม่มีในจังหวัด ค้นหาตามภาค
              const { data: region } = await supabase
                .from('provinces')
                .select('region')
                .eq('id', selectedProvince)
                .single();
              if (region) {
                const { data: regionStores } = await supabase
                  .from('stores')
                  .select('*, subdistricts!inner(districts!inner(provinces!inner(region)))')
                  .eq('subdistricts.districts.provinces.region', region.region);
                data = regionStores;
              }
            }
          }
        }
      }

      setStores(data || []);
    };

    if (selectedSubdistrict) {
      fetchStores();
    }
  }, [selectedSubdistrict, selectedDistrict, selectedProvince]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ค้นหาร้านค้า</h1>
      
      {/* Dropdown จังหวัด */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">จังหวัด</label>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="">เลือกจังหวัด</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown อำเภอ */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">อำเภอ</label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="p-2 border rounded w-full"
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

      {/* Dropdown ตำบล */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">ตำบล</label>
        <select
          value={selectedSubdistrict}
          onChange={(e) => setSelectedSubdistrict(e.target.value)}
          className="p-2 border rounded w-full"
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

      {/* แสดงร้านค้า */}
      <div>
        <h2 className="text-xl font-semibold mb-2">ร้านค้า</h2>
        {stores.length === 0 ? (
          <p className="text-gray-500">ไม่มีร้านค้าในพื้นที่ที่เลือก</p>
        ) : (
          <div className="grid gap-4">
            {stores.map((store) => (
              <div key={store.id} className="p-4 border rounded shadow-sm">
                <h3 className="text-lg font-medium">{store.name}</h3>
                <p className="text-sm text-gray-600">หมวดหมู่: {store.category}</p>
                <p className="text-sm text-gray-600">ตำบล: {store.subdistricts.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}