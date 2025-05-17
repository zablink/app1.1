// pages/underconstruction.tsx
import Head from 'next/head';

export default function UnderConstruction() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
        <title>Zablink กำลังจัดทำเว็บไซต์</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 px-4">
        <div className="text-center p-8 bg-white shadow-2xl rounded-2xl max-w-xl w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-orange-600 mb-4">
            🚧 เว็บไซต์กำลังจัดทำ
          </h1>
          <p className="text-gray-700 text-base sm:text-lg mb-6">
            เรากำลังเตรียมความพร้อมให้ดีที่สุด สำหรับร้านอาหาร เครื่องดื่ม และลูกค้าทุกๆ ท่าน
          </p>
          <div className="flex justify-center">
            <span className="inline-block text-sm text-gray-500">
              ขอบคุณที่แวะเข้ามานะครับ 🙏
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
