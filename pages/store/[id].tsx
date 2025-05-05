import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function StoreDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [store, setStore] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", isAnonymous: false });

  useEffect(() => {
    if (id) {
      fetch(`/api/store/${id}`)
        .then(res => res.json())
        .then(data => setStore(data.store));

      fetch(`/api/store/${id}/reviews`)
        .then(res => res.json())
        .then(data => setReviews(data.reviews || []));
    }
  }, [id]);

  const handleSubmitReview = async () => {
    const res = await fetch(`/api/store/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
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

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">รายละเอียดร้านค้า</h1>
      {store ? (
        <div className="space-y-2">
          <p><strong>ชื่อร้าน:</strong> {store.name}</p>
          <p><strong>คำอธิบาย:</strong> {store.description}</p>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูลร้าน...</p>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mt-8">รีวิวจากลูกค้า</h2>
        {reviews.length === 0 && <p>ยังไม่มีรีวิว</p>}
        {reviews.map((review: any) => (
          <div key={review.id} className="border rounded p-4 space-y-2">
            <p><strong>ให้คะแนน:</strong> {review.rating} ดาว</p>
            <p>{review.comment}</p>
            <p className="text-sm text-gray-500">
              โดย: {review.is_anonymous ? "ไม่เปิดเผยตัวตน" : review.user_email}
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
    </div>
  );
}
