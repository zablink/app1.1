// src/app/underconstruction/page.tsx หรือ pages/underconstruction.tsx
export default function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-100 dark:from-gray-900 dark:to-gray-800 px-6 text-center">
      <img
        src="/images/undercon.svg" // 
        alt="Under Construction"
        className="w-64 h-auto mb-6"
      />
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
        🌟 เว็บไซต์นี้กำลังจะเปิดให้บริการเร็ว ๆ นี้!
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-6">
        ตอนนี้เรากำลังเตรียมพื้นที่สำหรับร้านค้าทั่วไทย ให้สามารถแสดงสินค้าและบริการได้อย่างมืออาชีพ
        <br />
        ไม่ว่าคุณจะเป็น <strong>พ่อค้าแม่ค้า</strong> หรือ <strong>ลูกค้าที่มองหาร้านค้าใกล้บ้าน</strong> — ที่นี่คือแหล่งรวมลิงก์ร้านค้าที่สะดวก ใช้งานง่าย และฟรี!
      </p>
      <p className="text-md text-gray-500 dark:text-gray-400">
        <a href="https://storyset.com/online">Image from Online illustrations by Storyset</a>
      </p>
    </div>
  );
}
