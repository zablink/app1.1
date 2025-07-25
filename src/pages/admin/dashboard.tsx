// /src/pages/admin/dashboard.tsx (หรืออาจจะรวมใน /src/pages/settings.tsx แล้วแสดงตาม role)
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
// แก้ไข: เพิ่ม FiUpload เข้ามาใน import
import { FiUser, FiMail, FiLock, FiSettings, FiSave, FiEdit, FiUsers, FiShoppingBag, FiDollarSign, FiBarChart, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
  // Common Profile Settings (for Admin's own profile)
  const [profileName, setProfileName] = useState('ชื่อผู้ดูแลระบบ');
  const [email, setEmail] = useState('admin@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/150x150/ffccdd/ffffff?text=Admin');
  const [isEditingName, setIsEditingName] = useState(false);

  // System Settings
  const [defaultShopPlan, setDefaultShopPlan] = useState('Free');
  const [registrationApprovalRequired, setRegistrationApprovalRequired] = useState(true);
  const [contactEmail, setContactEmail] = useState('support@zablink.com');
  const [termsAndConditionsLink, setTermsAndConditionsLink] = useState('/terms');
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState('/privacy');

  // Function to handle avatar upload (common)
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log('Uploading admin avatar:', file.name);
      setAvatarUrl(URL.createObjectURL(file));
      setTimeout(() => {
        alert('รูปโปรไฟล์ผู้ดูแลอัปโหลดแล้ว (จำลอง)');
      }, 500);
    }
  };

  // Function to handle password change (common)
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    console.log('Changing admin password...');
    alert('เปลี่ยนรหัสผ่านผู้ดูแลแล้ว (จำลอง)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Function to handle profile name update (common)
  const handleUpdateProfileName = () => {
    console.log('Updating admin profile name to:', profileName);
    setIsEditingName(false);
    alert('อัปเดตชื่อโปรไฟล์ผู้ดูแลแล้ว (จำลอง)');
  };

  // Function to handle system settings update
  const handleUpdateSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating system settings:', {
      defaultShopPlan,
      registrationApprovalRequired,
      contactEmail,
      termsAndConditionsLink,
      privacyPolicyLink,
    });
    alert('อัปเดตการตั้งค่าระบบแล้ว (จำลอง)');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>ตั้งค่าผู้ดูแลระบบ</title>
      </Head>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">ตั้งค่าผู้ดูแลระบบ</h1>

        {/* Admin Profile Information Section (for Admin's own account) */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FiUser className="mr-2" /> ข้อมูลโปรไฟล์ผู้ดูแล
          </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-md">
              <img src={avatarUrl} alt="Admin Avatar" className="w-full h-full object-cover" />
              <label htmlFor="admin-avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <FiUpload size={24} />
              </label>
              <input id="admin-avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <p className="text-gray-600 mt-2">อัปเดตรูปโปรไฟล์ผู้ดูแล</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ดูแลระบบ</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={!isEditingName}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                    isEditingName ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
                {!isEditingName ? (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="ml-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="แก้ไขชื่อผู้ดูแล"
                  >
                    <FiEdit size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleUpdateProfileName}
                    className="ml-2 p-2 rounded-full text-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="บันทึกชื่อผู้ดูแล"
                  >
                    <FiSave size={20} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมลผู้ดูแลระบบ</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Change Password Section (Common) */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FiLock className="mr-2" /> เปลี่ยนรหัสผ่านผู้ดูแล
          </h2>
          <form onSubmit={handleChangePassword}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="mt-6 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                บันทึกรหัสผ่าน
              </motion.button>
            </div>
          </form>
        </div>

        {/* System Settings Section */}
        <div className="p-6 border border-gray-200 rounded-lg bg-red-50">
          <h2 className="text-2xl font-semibold text-red-700 mb-4 flex items-center">
            <FiSettings className="mr-2" /> การตั้งค่าระบบ
          </h2>
          <form onSubmit={handleUpdateSystemSettings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="defaultShopPlan" className="block text-sm font-medium text-gray-700 mb-1">แผนร้านค้าเริ่มต้น</label>
                <select
                  id="defaultShopPlan"
                  value={defaultShopPlan}
                  onChange={(e) => setDefaultShopPlan(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="Free">Free</option>
                  <option value="Pro1">Pro1</option>
                  <option value="Pro2">Pro2</option>
                  <option value="Pro3">Pro3</option>
                </select>
              </div>
              <div>
                <label htmlFor="registrationApprovalRequired" className="block text-sm font-medium text-gray-700 mb-1">ต้องอนุมัติการลงทะเบียนร้านค้า</label>
                <input
                  type="checkbox"
                  id="registrationApprovalRequired"
                  checked={registrationApprovalRequired}
                  onChange={(e) => setRegistrationApprovalRequired(e.target.checked)}
                  className="mt-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">เปิดใช้งานการอนุมัติด้วยตนเอง</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">อีเมลติดต่อสำหรับผู้ใช้</label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="termsAndConditionsLink" className="block text-sm font-medium text-gray-700 mb-1">ลิงก์ข้อกำหนดและเงื่อนไข</label>
                <input
                  type="text"
                  id="termsAndConditionsLink"
                  value={termsAndConditionsLink}
                  onChange={(e) => setTermsAndConditionsLink(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="privacyPolicyLink" className="block text-sm font-medium text-gray-700 mb-1">ลิงก์นโยบายความเป็นส่วนตัว</label>
                <input
                  type="text"
                  id="privacyPolicyLink"
                  value={privacyPolicyLink}
                  onChange={(e) => setPrivacyPolicyLink(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-6 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                บันทึกการตั้งค่าระบบ
              </motion.button>
            </div>
          </form>
        </div>

        {/* Quick Links to Admin Management Pages */}
        <div className="p-6 border border-gray-200 rounded-lg bg-blue-50">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
            <FiBarChart className="mr-2" /> ลิงก์ไปยังหน้าจัดการ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-md shadow hover:bg-blue-200 transition-colors"
              >
                <FiUsers className="mr-2" /> จัดการผู้ใช้
              </motion.a>
            </Link>
            <Link href="/admin/shops">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-md shadow hover:bg-blue-200 transition-colors"
              >
                <FiShoppingBag className="mr-2" /> จัดการร้านค้า
              </motion.a>
            </Link>
            <Link href="/admin/ads">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-md shadow hover:bg-blue-200 transition-colors"
              >
                <FiDollarSign className="mr-2" /> จัดการโฆษณา
              </motion.a>
            </Link>
            {/* Add more links as needed */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
