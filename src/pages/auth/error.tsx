// pages/auth/error.tsx

import { useRouter } from 'next/router';
import React from 'react';
import { IoAlertCircleOutline } from 'react-icons/io5'; // Icon สำหรับแจ้งเตือน

const AuthErrorPage: React.FC = () => {
  const router = useRouter();
  const { error } = router.query; // รับค่า error จาก query parameter

  let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง";
  let detailedMessage = "";
  let iconColor = "text-red-500";

  if (typeof error === 'string') {
    // ตรวจสอบ Error ที่เรากำหนดเอง
    if (error.startsWith("AuthMethodMismatch:")) {
      const originalProvider = error.split(":")[1];
      errorMessage = "อีเมลนี้เคยลงทะเบียนด้วยวิธีอื่น";
      detailedMessage = `คุณเคยเข้าสู่ระบบด้วย ${originalProvider} โปรดใช้ช่องทางเดิมเพื่อเข้าสู่ระบบ`;
      iconColor = "text-orange-500";
    }
    // NextAuth Error ทั่วไปที่อาจเกิดขึ้น
    else {
      switch (error) {
        case 'OAuthAccountNotLinked':
          errorMessage = "บัญชี Social Media นี้ยังไม่ได้เชื่อมโยงกับบัญชีของคุณ";
          detailedMessage = "โปรดตรวจสอบว่าคุณได้เข้าสู่ระบบด้วยบัญชีที่ถูกต้อง หรือลองเข้าสู่ระบบด้วยวิธีเดิม";
          iconColor = "text-yellow-500";
          break;
        case 'AccessDenied':
          errorMessage = "ไม่ได้รับอนุญาตให้เข้าถึง";
          detailedMessage = "อาจเป็นเพราะคุณไม่ได้ยืนยันอีเมล หรือบัญชีของคุณถูกระงับ โปรดติดต่อผู้ดูแลระบบ";
          iconColor = "text-red-500";
          break;
        case 'Verification':
          errorMessage = "ลิงก์ยืนยันตัวตนไม่ถูกต้องหรือไม่หมดอายุ";
          detailedMessage = "โปรดตรวจสอบอีเมลของคุณอีกครั้ง หรือลองขอลิงก์ใหม่";
          iconColor = "text-yellow-500";
          break;
        case 'Configuration':
          errorMessage = "การตั้งค่าระบบไม่ถูกต้อง";
          detailedMessage = "โปรดติดต่อผู้ดูแลระบบ";
          iconColor = "text-red-500";
          break;
        default:
          errorMessage = `เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error}`;
          detailedMessage = "โปรดลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ";
          iconColor = "text-gray-500";
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full border border-gray-200">
        <div className={`flex justify-center mb-6 ${iconColor}`}>
          <IoAlertCircleOutline className="h-20 w-20" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">เข้าสู่ระบบไม่สำเร็จ</h1>
        <p className="text-xl font-semibold text-gray-800 mb-2">{errorMessage}</p>
        {detailedMessage && <p className="text-md text-gray-600 mb-6">{detailedMessage}</p>}
        <button
          onClick={() => router.push('/login')} // หรือหน้า login ของคุณ
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
};

export default AuthErrorPage;
