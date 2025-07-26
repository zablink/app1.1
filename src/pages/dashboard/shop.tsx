// /src/pages/dashboard/shop.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
// แก้ไข: เปลี่ยน FiStore เป็น FiShoppingBag และเพิ่ม FiX สำหรับปุ่มลบลิงก์/รูปภาพ
import { FiUser, FiMail, FiLock, FiImage, FiUpload, FiSave, FiEdit, FiMapPin, FiLink, FiCamera, FiAward, FiDollarSign, FiShoppingBag, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ShopSettingsPage() {
  // Common Profile Settings
  const [profileName, setProfileName] = useState('ชื่อผู้จัดการร้าน');
  const [email, setEmail] = useState('shop_manager@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/150x150/ccbbff/ffffff?text=Shop+Manager');
  const [isEditingName, setIsEditingName] = useState(false);

  // Shop Specific Settings
  const [shopName, setShopName] = useState('ชื่อร้านอาหารของคุณ');
  const [shopDescription, setShopDescription] = useState('คำอธิบายเกี่ยวกับร้านอาหารของคุณ...');
  const [location, setLocation] = useState('123 ถนนสุขุมวิท, แขวงคลองตัน, เขตวัฒนา, กรุงเทพมหานคร');
  const [deliveryLinks, setDeliveryLinks] = useState([
    { platform: 'GrabFood', url: 'https://grab.com/yourshop' },
    { platform: 'Foodpanda', url: 'https://foodpanda.com/yourshop' },
  ]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]); // Array of image URLs
  const [bannerImage, setBannerImage] = useState('https://placehold.co/1200x300/ffccaa/ffffff?text=Shop+Banner');
  const [shopAvatar, setShopAvatar] = useState('https://placehold.co/150x150/aaccff/ffffff?text=Shop+Logo');
  const [shopThumbnail, setShopThumbnail] = useState('https://placehold.co/300x200/ffddcc/ffffff?text=Shop+Thumbnail');
  const [currentPlan, setCurrentPlan] = useState('Free'); // Free, Pro1, Pro2, Pro3

  // Helper for adding/removing delivery links
  const handleAddDeliveryLink = () => {
    setDeliveryLinks([...deliveryLinks, { platform: '', url: '' }]);
  };

  const handleDeliveryLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...deliveryLinks];
    // @ts-ignore
    newLinks[index][field] = value;
    setDeliveryLinks(newLinks);
  };

  const handleRemoveDeliveryLink = (index: number) => {
    setDeliveryLinks(deliveryLinks.filter((_, i) => i !== index));
  };

  // Helper for gallery image upload
  const handleGalleryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        console.log('Uploading gallery image:', file.name);
        // In real app: upload to Supabase Storage and get URL
        setGalleryImages(prev => [...prev, URL.createObjectURL(file)]); // For preview
      });
      alert('รูปภาพแกลเลอรีอัปโหลดแล้ว (จำลอง)');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Helper for single image upload (banner, shop avatar, thumbnail)
  const handleSingleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImageSetter: React.Dispatch<React.SetStateAction<string>>,
    imageType: string
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log(`Uploading ${imageType}:`, file.name);
      // In real app: upload to Supabase Storage and get URL
      setImageSetter(URL.createObjectURL(file)); // For preview
      alert(`${imageType} อัปโหลดแล้ว (จำลอง)`);
    }
  };

  // Function to handle password change (common)
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    console.log('Changing password...');
    alert('เปลี่ยนรหัสผ่านแล้ว (จำลอง)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Function to handle profile name update (common)
  const handleUpdateProfileName = () => {
    console.log('Updating manager profile name to:', profileName);
    setIsEditingName(false);
    alert('อัปเดตชื่อผู้จัดการโปรไฟล์แล้ว (จำลอง)');
  };

  // Function to handle shop info update
  const handleUpdateShopInfo = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating shop info:', { shopName, shopDescription, location, deliveryLinks });
    alert('อัปเดตข้อมูลร้านค้าแล้ว (จำลอง)');
  };

  // Function to handle plan upgrade/downgrade
  const handlePlanChange = (plan: string) => {
    setCurrentPlan(plan);
    alert(`เปลี่ยนแผนเป็น ${plan} แล้ว (จำลอง)`);
    // In real app, this would involve payment gateway and backend logic
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>ตั้งค่าร้านค้า</title>
      </Head>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">ตั้งค่าร้านค้าของคุณ</h1>

        {/* Manager Profile Information Section */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <FiUser className="mr-2" /> ข้อมูลผู้จัดการร้าน
          </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-md">
              <img src={avatarUrl} alt="Manager Avatar" className="w-full h-full object-cover" />
              <label htmlFor="manager-avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <FiUpload size={24} />
              </label>
              <input id="manager-avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageUpload(e, setAvatarUrl, 'Manager Avatar')} />
            </div>
            <p className="text-gray-600 mt-2">อัปเดตรูปโปรไฟล์ผู้จัดการ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้จัดการ</label>
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
                    aria-label="แก้ไขชื่อผู้จัดการ"
                  >
                    <FiEdit size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleUpdateProfileName}
                    className="ml-2 p-2 rounded-full text-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="บันทึกชื่อผู้จัดการ"
                  >
                    <FiSave size={20} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมลผู้จัดการ</label>
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
            <FiLock className="mr-2" /> เปลี่ยนรหัสผ่านผู้จัดการ
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

        {/* Shop Information Section */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-green-50">
          <h2 className="text-2xl font-semibold text-green-700 mb-4 flex items-center">
            <FiShoppingBag className="mr-2" /> ข้อมูลร้านค้า {/* แก้ไขตรงนี้ */}
          </h2>
          <form onSubmit={handleUpdateShopInfo}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้าน</label>
                <input
                  type="text"
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">ที่ตั้งร้าน</label>
                <div className="flex items-center mt-1">
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="เช่น 123 ถนนสุขุมวิท"
                  />
                  <button type="button" className="ml-2 p-2 rounded-full text-gray-600 hover:bg-gray-100" title="เลือกจากแผนที่ (จำลอง)">
                    <FiMapPin size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายร้านค้า</label>
              <textarea
                id="shopDescription"
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              ></textarea>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                <FiLink className="mr-2" /> ลิงก์เดลิเวอรี่
              </h3>
              {deliveryLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="แพลตฟอร์ม (เช่น GrabFood)"
                    value={link.platform}
                    onChange={(e) => handleDeliveryLinkChange(index, 'platform', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                  <input
                    type="url"
                    placeholder="URL ลิงก์"
                    value={link.url}
                    onChange={(e) => handleDeliveryLinkChange(index, 'url', e.target.value)}
                    className="flex-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                  <button type="button" onClick={() => handleRemoveDeliveryLink(index)} className="p-2 rounded-full text-red-600 hover:bg-red-100" title="ลบลิงก์">
                    <FiX size={20} />
                  </button>
                </div>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleAddDeliveryLink}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiLink className="mr-2" /> เพิ่มลิงก์
              </motion.button>
            </div>

            <div className="mt-6 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                บันทึกข้อมูลร้านค้า
              </motion.button>
            </div>
          </form>
        </div>

        {/* Shop Images Section */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-yellow-50">
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4 flex items-center">
            <FiCamera className="mr-2" /> รูปภาพร้านค้า
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Shop Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รูป Avatar ของร้าน (โลโก้)</label>
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-yellow-500 shadow-md mx-auto mb-2">
                <img src={shopAvatar} alt="Shop Avatar" className="w-full h-full object-cover" />
                <label htmlFor="shop-avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <FiUpload size={24} />
                </label>
                <input id="shop-avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageUpload(e, setShopAvatar, 'Shop Avatar')} />
              </div>
              <p className="text-center text-gray-600 text-xs">ขนาดแนะนำ: 150x150px</p>
            </div>

            {/* Shop Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รูป Thumbnail ของร้าน</label>
              <div className="relative w-48 h-32 overflow-hidden border-2 border-yellow-500 shadow-md mx-auto mb-2">
                <img src={shopThumbnail} alt="Shop Thumbnail" className="w-full h-full object-cover" />
                <label htmlFor="shop-thumbnail-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <FiUpload size={24} />
                </label>
                <input id="shop-thumbnail-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageUpload(e, setShopThumbnail, 'Shop Thumbnail')} />
              </div>
              <p className="text-center text-gray-600 text-xs">ขนาดแนะนำ: 300x200px</p>
            </div>

            {/* Shop Banner */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">ภาพ Banner ของร้าน</label>
              <div className="relative w-full h-48 overflow-hidden border-2 border-yellow-500 shadow-md mb-2">
                <img src={bannerImage} alt="Shop Banner" className="w-full h-full object-cover" />
                <label htmlFor="shop-banner-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <FiUpload size={24} />
                </label>
                <input id="shop-banner-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageUpload(e, setBannerImage, 'Shop Banner')} />
              </div>
              <p className="text-center text-gray-600 text-xs">ขนาดแนะนำ: 1200x300px</p>
            </div>

            {/* Gallery Images */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                <FiImage className="mr-2" /> แกลเลอรีรูปภาพ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                {galleryImages.map((img, index) => (
                  <div key={index} className="relative w-full h-24 rounded-md overflow-hidden border border-gray-300">
                    <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button onClick={() => handleRemoveGalleryImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs" title="ลบรูป">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                <label htmlFor="gallery-upload" className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <FiUpload size={24} className="text-gray-400" />
                  <input id="gallery-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryImageUpload} />
                </label>
              </div>
              <p className="text-center text-gray-600 text-xs">เพิ่มรูปภาพอาหารและบรรยากาศร้านของคุณ</p>
            </div>
          </div>
        </div>

        {/* Subscription Plan Section */}
        <div className="p-6 border border-gray-200 rounded-lg bg-purple-50">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center">
            <FiAward className="mr-2" /> แผนบริการของคุณ
          </h2>
          <p className="text-gray-700 mb-4">
            แผนบริการปัจจุบันของคุณ: <span className="font-bold text-purple-800">{currentPlan}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Free', 'Pro1', 'Pro2', 'Pro3'].map(plan => (
              <motion.div
                key={plan}
                className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ${
                  currentPlan === plan ? 'border-purple-600 bg-purple-100 shadow-md' : 'border-gray-300 hover:border-purple-400'
                }`}
                onClick={() => handlePlanChange(plan)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan}</h3>
                <p className="text-gray-600 text-sm">
                  {plan === 'Free' && 'รายชื่อร้านพื้นฐาน, รูปภาพจำกัด'}
                  {plan === 'Pro1' && 'รูปภาพมากขึ้น, สร้างโปรโมชั่นพื้นฐาน'}
                  {plan === 'Pro2' && 'รูปภาพไม่จำกัด, วิดีโอ, สถิติเชิงลึก, โฆษณาในพื้นที่'}
                  {plan === 'Pro3' && 'จัดอันดับพิเศษ, สนับสนุนพรีเมียม, โฆษณาได้ทุกประเภท'}
                </p>
                {plan !== 'Free' && <p className="text-lg font-semibold text-purple-600 mt-2 flex items-center justify-center"><FiDollarSign className="mr-1" /> ราคา: XX บาท/เดือน</p>}
                {currentPlan === plan ? (
                  <span className="mt-2 inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full">แผนปัจจุบัน</span>
                ) : (
                  <button className="mt-2 inline-block bg-purple-500 text-white text-xs px-3 py-1 rounded-md hover:bg-purple-600">
                    เลือกแผนนี้
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-4 text-center">
            *โปรพิเศษจาก Admin จะถูกกำหนดโดยผู้ดูแลระบบและไม่แสดงในส่วนนี้
          </p>
        </div>
      </motion.div>
    </div>
  );
}
