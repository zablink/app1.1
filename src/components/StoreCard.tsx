// components/StoreCard.tsx
export default function StoreCard({ store }: { store: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-primary">{store.name}</h3>
      <p className="text-sm text-gray-600">{store.description}</p>
      <a href={`/store/${store.id}`} className="text-blue-500 mt-2 inline-block">ดูร้าน</a>
    </div>
  );
}
