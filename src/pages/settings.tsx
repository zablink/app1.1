// /pages/settings.tsx
// this is Settings for USER role
// /src/pages/settings/user.tsx (หรืออาจจะรวมใน /src/pages/settings.tsx แล้วแสดงตาม role)
import React, { useState } from 'react';
import Head from 'next/head';
import Link from "next/link";
// แก้ไข: เปลี่ยน FiStore เป็น FiShoppingBag
import { FiUser, FiMail, FiLock, FiImage, FiUpload, FiSave, FiEdit, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion'; // สำหรับ animation เล็กน้อย
import Layout from "@/components/Layout"; // ตรวจสอบให้แน่ใจว่า path นี้ถูกต้อง

export default function UserSettingsPage() {
  const [profileName, setProfileName] = useState('ชื่อผู้ใช้งานปัจจุบัน');
  const [email, setEmail] = useState('user@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/150x150/aabbcc/ffffff?text=User'); // Placeholder avatar
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null); // สำหรับเก็บไฟล์ avatar ที่รอการอัปโหลด

  // Function to handle avatar selection (for preview and pending upload)
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarUrl(URL.createObjectURL(file)); // For immediate preview
      setPendingAvatarFile(file); // Store file for later upload
    }
  };

  // Function to handle saving profile information (name and avatar)
  const handleSaveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้า
    console.log('Updating profile name to:', profileName);
    // In a real application, you would update the user's name in your database (e.g., Supabase)

    if (pendingAvatarFile) {
      // In a real application, you would upload this file to Supabase Storage
      console.log('Uploading new avatar:', pendingAvatarFile.name);
      // Simulate upload success
      setTimeout(() => {
        alert('รูปโปรไฟล์อัปโหลดแล้ว');
        setPendingAvatarFile(null); // Clear pending file after simulated upload
      }, 500);
    }
    alert('อัปเดตข้อมูลโปรไฟล์แล้ว');
  };

  // Function to handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    // In a real application, you would call your authentication service (e.g., NextAuth)
    // to update the password.
    console.log('Changing password...');
    alert('เปลี่ยนรหัสผ่านแล้ว');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>ตั้งค่าโปรไฟล์ผู้ใช้</title>
        </Head>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">ตั้งค่าโปรไฟล์ผู้ใช้</h1>

          {/* Profile Information Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <FiUser className="mr-2" /> ข้อมูลโปรไฟล์
            </h2>
            <form onSubmit={handleSaveProfileInfo}> {/* ใช้ form สำหรับการบันทึกข้อมูลโปรไฟล์ */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-md">
                  <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                    <FiUpload size={24} />
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                </div>
                <p className="text-gray-600 mt-2">อัปเดตรูปโปรไฟล์ของคุณ</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
                  <input
                    type="text"
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled // Email usually cannot be changed directly from here, depends on auth provider
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 text-right">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" // ใช้ type="submit" เพื่อผูกกับ form
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <FiSave className="mr-2" /> บันทึกข้อมูลโปรไฟล์
                </motion.button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <FiLock className="mr-2" /> เปลี่ยนรหัสผ่าน
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

          {/* Become a Shop Section */}
          <div className="p-6 border border-gray-200 rounded-lg bg-blue-50">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
              <FiShoppingBag className="mr-2" /> ต้องการเป็นร้านค้า?
            </h2>
            <p className="text-gray-700 mb-4">
              หากคุณเป็นเจ้าของร้านอาหารและต้องการโปรโมทร้านของคุณบนแพลตฟอร์มของเรา คุณสามารถลงทะเบียนเป็นร้านค้าได้ที่นี่
            </p>
            <Link href="/register-shop">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiShoppingBag className="mr-2" /> ลงทะเบียนร้านค้า
              </motion.a>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
