import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Store } from "@/types/store";
//import { Review } from "@/types/reviews";
import { Link as StoreLink } from "@/types/link";  
import Navbar from "@/components/Navbar";

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
  const storeId = Array.isArray(id) ? id[0] : id;

  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedStores, setRelatedStores] = useState<NearbyStore[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", isAnonymous: false });
  const [links, setLinks] = useState<StoreLink[]>([]);

  useEffect(() => {
    console.log("StoreID :: " , storeId);
    if (typeof storeId === "string") {
      fetch(`/api/stores/${storeId}`)
        .then((res) => res.json())
        .then((data) => setStore(data.store as Store))
        .catch((err) => console.error("Store fetch error:", err));

      fetch(`/api/stores/${storeId}/links`)
        .then((res) => res.json())
        .then((data) => setLinks(data.links || []))
        .catch((err) => console.error("Links fetch error:", err));  

      fetch(`/api/stores/${storeId}/reviews`)
        .then((res) => res.json())
        .then((data) => setReviews(data.reviews || []))
        .catch((err) => console.error("Reviews fetch error:", err));

      fetch(`/api/stores/${storeId}/related`)
        .then((res) => res.json())
        .then((data) => setRelatedStores(data.relatedStores || []))
        .catch((err) => console.error("Related stores fetch error:", err));
    }
  }, [storeId]);

  const handleSubmitReview = async () => {
    try {
      const res = await fetch(`/api/stores/${storeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) {
        setNewReview({ rating: 5, comment: "", isAnonymous: false });
        setReviews([json.review, ...reviews]);
      } else {
        alert(json.error);
      }
    } catch (error) {
      console.error("Submit review error:", error);
    }
  };

  const handleReportReview = async (reviewId: string) => {
    try {
      const res = await fetch("/api/report-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId }),
      });
      const json = await res.json();
      alert(json.message || "แจ้งเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Report review error:", error);
    }
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
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-neutral px-4 py-8 text-gray-800">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Breadcrumb */}
          <div>
            <Link href="/" className="text-blue-600 hover:underline">
              ← กลับไปหน้าแรก
            </Link>
          </div>


          {/* ข้อมูลร้าน */}
          {store ? (
          <h1 className="text-3xl md:text-4xl font-semibold text-primary">{store.name}</h1>
          ):(<p>...</p>)}

          {store?.cover_url && (
            <div className="w-full aspect-[16/9] relative overflow-hidden rounded-lg">
              <img
                src={store.cover_url.startsWith('/') ? store.cover_url : `/store-images/${store.cover_url}`}
                alt="รูปภาพหน้าปกร้าน"
                className="w-full h-full object-cover"  
              />
            </div>
          )}

          {store ? (
            <div className="space-y-2">
              <p><strong>ชื่อร้าน:</strong> {store.name}</p>
              {store.category && <p><strong>หมวดหมู่:</strong> {store.category}</p>}
              <p><strong>คำอธิบาย:</strong> {store.description}</p>
            </div>
          ) : (
            <p>กำลังโหลดข้อมูลร้าน...</p>
             
          )}

          <div>
            {/* ตัวอย่างแสดงลิงก์ */}
            {links.length > 0 ? (
              <ul>
                {links.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.title || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>ไม่มีลิงก์</p>
            )}
          </div>

          {/* รีวิวลูกค้า */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mt-8">รีวิวจากลูกค้า</h2>
            {reviews.length === 0 && <p>ยังไม่มีรีวิว</p>}
            {reviews.map((review) => (
              <div key={review.id} className="border rounded p-4 space-y-2 bg-white">
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

          {/* เขียนรีวิวใหม่ */}
          <div className="space-y-4 mt-10">
            <h2 className="text-2xl font-semibold">เขียนรีวิวใหม่</h2>
            {/* สามารถเพิ่ม form input ที่นี่ตามต้องการ */}
            {/* ตัวอย่าง */}
            <div className="space-y-2">
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                placeholder="แสดงความคิดเห็น..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />
              <div className="flex items-center space-x-4">
                <label>
                  <input
                    type="checkbox"
                    checked={newReview.isAnonymous}
                    onChange={(e) =>
                      setNewReview({ ...newReview, isAnonymous: e.target.checked })
                    }
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
            </div>
          </div>

          {/* ร้านใกล้เคียง */}
          <div className="space-y-6 mt-10">
            <h2 className="text-2xl font-semibold">ร้านค้าใกล้เคียง</h2>
            {[1, 2, 3, 4, 5].map((level) =>
              groupedStores[level].length > 0 ? (
                <div key={level} className="space-y-2">
                  <h3 className="font-semibold">{proximityLabels[level]}</h3>
                  <ul className="space-y-2">
                    {groupedStores[level].map((store) => (
                      <li key={store.id} className="border p-3 rounded bg-white hover:bg-gray-50 transition">
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
      </div>
    </>
  );
}
