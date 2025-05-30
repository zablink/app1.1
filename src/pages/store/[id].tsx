/*

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  description: string;
  category?: string;
}

type Review = {
  id: string;
  store_id: number;
  rating: number;
  comment: string;
  created_at: string;
  anonymous: boolean;
  user_id: string;
  is_anonymous: boolean;
  user_profiles?: {
    nickname?: string;
  };
  users?: {
    email?: string;
  };
};

type NearbyStore = {
  id: number;
  name: string;
  subdistrict_name: string;
  district_name: string;
  province_name: string;
  proximity_level: number;
};

export default function StoreDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedStores, setRelatedStores] = useState<NearbyStore[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", isAnonymous: false });

  useEffect(() => {
    if (id) {
      fetch(`/api/store/${id}`)
        .then((res) => res.json())
        .then((data) => setStore(data.store));

      fetch(`/api/store/${id}/reviews`)
        .then((res) => res.json())
        .then((data) => setReviews(data.reviews || []));

      fetch(`/api/store/${id}/related`)
        .then((res) => res.json())
        .then((data) => setRelatedStores(data.relatedStores || []));
    }
  }, [id]);

  const handleSubmitReview = async () => {
    const res = await fetch(`/api/store/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
      credentials: "include", // ✅ เพิ่มตรงนี้
    });
    const json = await res.json();
    if (res.ok) {
      setNewReview({ rating: 5, comment: "", isAnonymous: false });
      setReviews([json.review, ...reviews]);
    } else {
      alert(json.error);
    }
  };


  const handleReportReview = async (reviewId: string) => {
    const res = await fetch("/api/report-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: reviewId }),
    });
    const json = await res.json();
    alert(json.message || "แจ้งเรียบร้อยแล้ว");
  };

  const groupedStores: Record<number, NearbyStore[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  relatedStores.forEach((store) => {
    groupedStores[store.proximity_level]?.push(store);
  });

  const proximityLabels: Record<number, string> = {
    1: "ร้านที่อยู่ในระยะ 5 กม.",
    2: "ร้านที่อยู่ในตำบลเดียวกัน",
    3: "ร้านที่อยู่ในอำเภอเดียวกัน",
    4: "ร้านที่อยู่ในจังหวัดเดียวกัน",
    5: "ร้านอื่นๆ ทั่วประเทศ",
  };

  return (
    <div className="p-6 space-y-8">
      {/ * Breadcrumb * /}
      <div> 
        <Link href="/stores" className="text-blue-600 hover:underline">
          ← ย้อนกลับไปหน้าร้านทั้งหมด
        </Link>
      </div>

      {/ * ข้อมูลร้าน * /}
      <h1 className="text-2xl font-bold">รายละเอียดร้านค้า</h1>
      {store ? (
        <div className="space-y-2">
          <p><strong>ชื่อร้าน:</strong> {store.name}</p>
          {store.category && <p><strong>หมวดหมู่:</strong> {store.category}</p>}
          <p><strong>คำอธิบาย:</strong> {store.description}</p>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูลร้าน...</p>
      )}

      {/ * รีวิวลูกค้า * /}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mt-8">รีวิวจากลูกค้า</h2>
        {reviews.length === 0 && <p>ยังไม่มีรีวิว</p>}
        {reviews.map((review) => (
          <div key={review.id} className="border rounded p-4 space-y-2">
            <p><strong>ให้คะแนน:</strong> {review.rating} ดาว</p>
            <p>{review.comment}</p>
            <p className="text-sm text-gray-500">
              โดย: {review.is_anonymous
                ? "ไม่เปิดเผยตัวตน"
                : review.user_profiles?.nickname || review.users?.email || "ผู้ใช้ทั่วไป"}
            </p>
            <button
              onClick={() => handleReportReview(review.id)}
              className="text-red-600 hover:underline text-sm"
            >
              แจ้งรีวิวไม่เหมาะสม
            </button>
          </div>
        ))}
      </div>

      {/ * เขียนรีวิวใหม่ *  /}
      <div className="space-y-4 mt-10">
        <h2 className="text-xl font-semibold">เขียนรีวิวใหม่</h2>
        <label className="block">
          <span>คะแนน:</span>
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
            className="block border rounded px-2 py-1 mt-1"
          >
            {[5, 4, 3, 2, 1].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span>ความคิดเห็น:</span>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="block w-full border rounded px-2 py-1 mt-1"
          />
        </label>
        <label className="block">
          <input
            type="checkbox"
            checked={newReview.isAnonymous}
            onChange={(e) => setNewReview({ ...newReview, isAnonymous: e.target.checked })}
          />
          <span className="ml-2">ไม่เปิดเผยตัวตน</span>
        </label>
        <button
          onClick={handleSubmitReview}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ส่งรีวิว
        </button>
      </div>

      {/ * ร้านใกล้เคียง * /}
      <div className="space-y-6 mt-10">
        <h2 className="text-xl font-semibold">ร้านค้าใกล้เคียง</h2>
        {[1, 2, 3, 4, 5].map((level) =>
          groupedStores[level].length > 0 ? (
            <div key={level} className="space-y-2">
              <h3 className="font-semibold">{proximityLabels[level]}</h3>
              <ul className="space-y-2">
                {groupedStores[level].map((store) => (
                  <li key={store.id} className="border p-3 rounded hover:bg-gray-50 transition">
                    <Link href={`/store/${store.id}`} className="text-blue-600 font-semibold hover:underline">
                      {store.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {store.subdistrict_name}, {store.district_name}, {store.province_name}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
*/


// pages/store/[id].tsx
import { useRouter } from "next/router";
import useSWR from "swr";
import axios from "axios";

// สมมุติว่าคุณมี Card component ที่ทำไว้
import StoreCard from "@/components/StoreCard";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function StorePage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: storeData, error: storeError } = useSWR(
    id ? `/api/store/${id}` : null,
    fetcher
  );

  const { data: reviewsData } = useSWR(
    id ? `/api/store/${id}/reviews` : null,
    fetcher
  );

  const { data: relatedStores } = useSWR(
    id ? `/api/store/${id}/related` : null,
    fetcher
  );

  if (!storeData) return <div className="text-center py-10 text-gray-500">Loading...</div>;
  if (storeError) return <div className="text-center py-10 text-red-500">Error loading store</div>;

  const { store } = storeData;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">{store.name}</h1>
        <p className="text-gray-600 mt-2">{store.description}</p>
      </div>

      {/* Store Info Card */}
      <div className="mb-8">
        <StoreCard store={store} />
      </div>

      {/* Contact / Social Links */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-secondary mb-2">ช่องทางการติดต่อ</h2>
        <div className="flex gap-4 text-blue-600 underline">
          {store.line && <a href={store.line} target="_blank" rel="noopener noreferrer">LINE</a>}
          {store.facebook && <a href={store.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
          {store.website && <a href={store.website} target="_blank" rel="noopener noreferrer">Website</a>}
        </div>
      </div>

      {/* Review Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-secondary mb-4">รีวิวจากลูกค้า</h2>
        {reviewsData?.reviews?.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.reviews.map((review: any) => (
              <div key={review.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="font-medium text-gray-800">{review.user_name}</p>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">ยังไม่มีรีวิว</p>
        )}
      </div>

      {/* Related Stores */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-secondary mb-4">ร้านใกล้เคียง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedStores?.related?.map((s: any) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
