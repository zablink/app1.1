// components/StoreReviews.tsx
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default function StoreReviews({ storeId }: { storeId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("rating, comment, created_at")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      setReviews(data || []);
    };

    fetchReviews();
  }, [storeId]);

  return (
    <ul className="space-y-4">
      {reviews.length === 0 && (
        <p className="text-gray-500">ยังไม่มีรีวิว</p>
      )}
      {reviews.map((r, i) => (
        <li key={i} className="border p-3 rounded">
          <p className="font-semibold">⭐ {r.rating}/5</p>
          <p>{r.comment}</p>
          <p className="text-sm text-gray-400">
            {new Date(r.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
