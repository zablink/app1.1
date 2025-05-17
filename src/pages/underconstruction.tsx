import Image from "next/image";

export default function UnderConstruction() {
  return (
    <main className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
        {/* Image */}
        <div className="flex justify-center">
          <img
            src="/images/undercon.svg"
            alt="Under Construction"
            className="w-80 md:w-[400px] drop-shadow-xl"
          />
        </div>

        {/* Text */}
        <div className="text-center md:text-left space-y-6">
          <img
            src="/images/zablink-logo-1024.png"
            alt="Zablink Logo"
            className="w-1/3 sm:w-1/2 mx-auto"
          />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Zablink เร็ว ๆ นี้!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            ตอนนี้เรากำลังเตรียมพื้นที่สำหรับร้านค้าทั่วไทย ให้สามารถแสดงสินค้าและบริการได้อย่างมืออาชีพ
            <br />
            ไม่ว่าคุณจะเป็น <strong>พ่อค้าแม่ค้า</strong> หรือ <strong>ลูกค้าที่มองหาร้านค้าใกล้บ้าน</strong> — 
            ที่นี่คือแหล่งรวมลิงก์ร้านค้าที่สะดวก ใช้งานง่าย พ่อค้าแม่ค้าขายคล่อง ลูกค้าค้นหาอาหารและเครื่องดื่มได้ตรงใจ
          </p>

        </div>
      </div>
    </main>
  );
}
