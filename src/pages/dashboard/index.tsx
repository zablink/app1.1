// src/pages/dashboard/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { useSession, signOut } from 'next-auth/react';
import { authOptions } from '../api/auth/[...nextauth]';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  User,
  Store,
  Settings,
  Star,
  Heart,
  Eye,
  BarChart3,
  Plus,
  Crown,
  Gift,
  LogOut,
  Bell,
  MapPin,
  Calendar,
  Zap
} from 'lucide-react';

interface DashboardData {
  userStats: {
    totalFavorites: number;
    totalReviews: number;
    totalShops: number;
    points: number;
    membershipType: string;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    date: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  favoriteShops: Array<{
    id: string;
    name: string;
    thumbnail_url: string;
    average_rating: number;
    total_reviews: number;
  }>;
}

interface DashboardProps {
  initialData: DashboardData;
}

export default function Dashboard({ initialData }: DashboardProps) {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'favorites' | 'settings'>('overview');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);

  const handleRoleUpgrade = async (newRole: 'shop') => {
    if (!session?.user?.id) return;

    setIsUpgrading(true);
    try {
      const response = await fetch('/api/user/upgrade-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id,
          newRole 
        }),
      });

      if (response.ok) {
        // อัพเดต session
        await updateSession();
        
        // Redirect ไปหน้า shop setup
        window.location.href = '/shops/setup';
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Role upgrade error:', error);
      alert('เกิดข้อผิดพลาดในการอัพเกรด');
    } finally {
      setIsUpgrading(false);
    }
  };

  const getMembershipBadge = (membershipType: string) => {
    switch (membershipType) {
      case 'free':
        return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">ฟรี</span>;
      case 'pro1':
        return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Pro 1</span>;
      case 'pro2':
        return <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Pro 2</span>;
      case 'pro3':
        return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">Pro 3</span>;
      case 'special':
        return <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full">Special</span>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">แอดมิน</span>;
      case 'shop':
        return <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">ร้านค้า</span>;
      case 'user':
      default:
        return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">ผู้ใช้</span>;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">กรุณาเข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ด</p>
          <Link 
            href="/auth/signin"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>แดชบอร์ด - ZabLink</title>
        <meta name="description" content="จัดการบัญชีผู้ใช้และร้านค้าของคุณ" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">Z</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">ZabLink</span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-1">
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">แดชบอร์ด</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  {dashboardData.notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {dashboardData.notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{session.user.name}</div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(session.user.role)}
                      {getMembershipBadge(session.user.membership_type)}
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                    {session.user.avatar_url ? (
                      <Image
                        src={session.user.avatar_url}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
                        {session.user.name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64">
              <nav className="bg-white rounded-xl shadow-md p-4">
                <ul className="space-y-2">
                  {[
                    { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
                    { id: 'activity', label: 'กิจกรรม', icon: Eye },
                    { id: 'favorites', label: 'ร้านโปรด', icon: Heart },
                    { id: 'settings', label: 'ตั้งค่า', icon: Settings },
                  ].map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h3>
                  <div className="space-y-2">
                    {session.user.role === 'user' && (
                      <button
                        onClick={() => handleRoleUpgrade('shop')}
                        disabled={isUpgrading}
                        className="w-full flex items-center space-x-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Store className="w-4 h-4" />
                        <span>{isUpgrading ? 'กำลังอัพเกรด...' : 'เป็นร้านค้า'}</span>
                      </button>
                    )}
                    
                    {session.user.role === 'shop' && (
                      <Link
                        href="/shops/create"
                        className="w-full flex items-center space-x-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>เพิ่มร้านใหม่</span>
                      </Link>
                    )}

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Welcome Message */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6">
                    <h1 className="text-2xl font-bold mb-2">
                      สวัสดี, {session.user.name}! 👋
                    </h1>
                    <p className="text-orange-100">
                      ยินดีต้อนรับสู่แดชบอร์ด ZabLink ของคุณ
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {dashboardData.userStats.totalFavorites}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">ร้านโปรด</h3>
                      <p className="text-sm text-gray-600">ร้านที่คุณถูกใจ</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {dashboardData.userStats.totalReviews}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">รีวิว</h3>
                      <p className="text-sm text-gray-600">รีวิวที่คุณเขียน</p>
                    </div>

                    {session.user.role === 'shop' && (
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-green-600" />
                          </div>
                          <span className="text-2xl font-bold text-gray-900">
                            {dashboardData.userStats.totalShops}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">ร้านของคุณ</h3>
                        <p className="text-sm text-gray-600">ร้านที่จัดการ</p>
                      </div>
                    )}

                    <div className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Gift className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {dashboardData.userStats.points}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">คะแนน</h3>
                      <p className="text-sm text-gray-600">สะสมเพื่อสิทธิพิเศษ</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">การดำเนินการด่วน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {session.user.role === 'user' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRoleUpgrade('shop')}
                          disabled={isUpgrading}
                          className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                        >
                          <Store className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-semibold">เป็นร้านค้า</div>
                            <div className="text-sm opacity-90">เริ่มขายอาหาร</div>
                          </div>
                        </motion.button>
                      )}

                      {session.user.role === 'shop' && (
                        <>
                          <Link
                            href="/shops/create"
                            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                          >
                            <Plus className="w-6 h-6" />
                            <div className="text-left">
                              <div className="font-semibold">เพิ่มร้านใหม่</div>
                              <div className="text-sm opacity-90">สร้างร้านอาหาร</div>
                            </div>
                          </Link>

                          <Link
                            href="/shop/dashboard"
                            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            <BarChart3 className="w-6 h-6" />
                            <div className="text-left">
                              <div className="font-semibold">จัดการร้าน</div>
                              <div className="text-sm opacity-90">ดูสถิติและแก้ไข</div>
                            </div>
                          </Link>
                        </>
                      )}

                      <Link
                        href="/packages"
                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                      >
                        <Crown className="w-6 h-6" />
                        <div className="text-left">
                          <div className="font-semibold">อัพเกรดแพ็คเกจ</div>
                          <div className="text-sm opacity-90">รับสิทธิพิเศษ</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">กิจกรรมล่าสุด</h2>
                    {dashboardData.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{activity.message}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.date).toLocaleDateString('th-TH')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">ยังไม่มีกิจกรรม</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">ร้านโปรดของคุณ</h2>
                  {dashboardData.favoriteShops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.favoriteShops.map((shop) => (
                        <Link
                          key={shop.id}
                          href={`/shops/${shop.id}`}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={shop.thumbnail_url || '/images/shop-placeholder.jpg'}
                              alt={shop.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {shop.average_rating.toFixed(1)} ({shop.total_reviews})
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        ยังไม่มีร้านโปรด
                      </h3>
                      <p className="text-gray-600 mb-4">
                        เริ่มค้นหาและเก็บร้านที่คุณชอบ
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        ค้นหาร้านอาหาร
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Profile Settings */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">ข้อมูลส่วนตัว</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อผู้ใช้
                        </label>
                        <input
                          type="text"
                          defaultValue={session.user.username || ''}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          อีเมล
                        </label>
                        <input
                          type="email"
                          value={session.user.email || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ไม่สามารถเปลี่ยนอีเมลได้
                        </p>
                      </div>

                      <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
                        บันทึกการเปลี่ยนแปลง
                      </button>
                    </div>
                  </div>

                  {/* Account Type */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">ประเภทบัญชี</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="w-6 h-6 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">สถานะปัจจุบัน</h3>
                            <p className="text-sm text-gray-600">
                              {session.user.role === 'user' && 'ผู้ใช้ทั่วไป'}
                              {session.user.role === 'shop' && 'เจ้าของร้านค้า'}
                              {session.user.role === 'admin' && 'ผู้ดูแลระบบ'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(session.user.role)}
                          {getMembershipBadge(session.user.membership_type)}
                        </div>
                      </div>

                      {session.user.role === 'user' && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Store className="w-6 h-6 text-green-600" />
                              <div>
                                <h3 className="font-semibold text-green-900">อัพเกรดเป็นร้านค้า</h3>
                                <p className="text-sm text-green-700">
                                  เริ่มขายอาหารและเข้าถึงเครื่องมือร้านค้า
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRoleUpgrade('shop')}
                              disabled={isUpgrading}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {isUpgrading ? 'กำลังอัพเกรด...' : 'อัพเกรด'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Membership Benefits */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">สิทธิประโยชน์</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">แพ็คเกจปัจจุบัน</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            {getMembershipBadge(session.user.membership_type)}
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• รีวิวร้านอาหาร</li>
                            <li>• เก็บร้านโปรด</li>
                            <li>• ค้นหาขั้นสูง</li>
                            {session.user.membership_type !== 'free' && (
                              <>
                                <li>• ไม่มีโฆษณา</li>
                                <li>• สิทธิพิเศษ</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">คะแนนสะสม</h3>
                          <div className="text-3xl font-bold text-orange-600 mb-2">
                            {dashboardData.userStats.points}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            รีวิวร้าน +10 คะแนน<br />
                            เข้าชมร้าน +1 คะแนน
                          </p>
                          <Link
                            href="/rewards"
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            ดูของรางวัล →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">กิจกรรมทั้งหมด</h2>
                  {dashboardData.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-4 border-l-4 border-orange-500 bg-orange-50">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{activity.message}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(activity.date).toLocaleString('th-TH')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        ยังไม่มีกิจกรรม
                      </h3>
                      <p className="text-gray-600">
                        เริ่มใช้งาน ZabLink เพื่อดูกิจกรรมของคุณ
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/dashboard',
        permanent: false,
      },
    };
  }

  try {
    // Mock data for now - replace with real API calls
    const initialData: DashboardData = {
      userStats: {
        totalFavorites: 0,
        totalReviews: 0,
        totalShops: session.user.role === 'shop' ? 1 : 0,
        points: 0,
        membershipType: session.user.membership_type,
      },
      recentActivity: [
        {
          id: '1',
          type: 'login',
          message: 'เข้าสู่ระบบผ่าน ' + (session.user.provider || 'อีเมล'),
          date: new Date().toISOString(),
        },
      ],
      notifications: [],
      favoriteShops: [],
    };

    return {
      props: {
        initialData,
      },
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    
    return {
      props: {
        initialData: {
          userStats: {
            totalFavorites: 0,
            totalReviews: 0,
            totalShops: 0,
            points: 0,
            membershipType: 'free',
          },
          recentActivity: [],
          notifications: [],
          favoriteShops: [],
        },
      },
    };
  }
};