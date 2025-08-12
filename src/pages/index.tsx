// src/pages/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter,
  Grid3X3,
  List,
  Phone,
  Clock,
  ChevronRight,
  Heart,
  Eye
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Shop {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  thumbnail_url: string;
  average_rating: number;
  total_reviews: number;
  food_category_name: string;
  subdistrict_name: string;
  district_name: string;
  province_name: string;
  package_name: string;
  priority_score: number;
  delivery_platforms: Array<{
    name: string;
    logo_url: string;
    url: string;
  }>;
  opening_hours: any;
  phone: string;
  distance_km?: number;
}

interface AdCampaign {
  id: string;
  shop_name: string;
  banner_image_url: string;
  banner_link_url: string;
  banner_alt_text: string;
  zone_name: string;
}

interface HomePageProps {
  featuredShops: Shop[];
  nearbyShops: Shop[];
  foodCategories: Array<{
    id: number;
    name_th: string;
    icon_url: string;
  }>;
  adCampaigns: {
    bannerTop: AdCampaign[];
    floatingRight: AdCampaign[];
    footerBanner: AdCampaign[];
  };
  userLocation?: {
    lat: number;
    lng: number;
  };
}

export default function HomePage({
  featuredShops,
  nearbyShops,
  foodCategories,
  adCampaigns,
  userLocation
}: HomePageProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter shops based on search and category
  useEffect(() => {
    let shops = nearbyShops;
    
    if (searchQuery) {
      shops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.food_category_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      shops = shops.filter(shop => shop.food_category_name === foodCategories.find(c => c.id === selectedCategory)?.name_th);
    }
    
    setFilteredShops(shops);
  }, [searchQuery, selectedCategory, nearbyShops, foodCategories]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // Log search for analytics
      try {
        await fetch('/api/analytics/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            searchQuery: query,
            categoryFilter: selectedCategory,
            userLocation 
          }),
        });
      } catch (error) {
        console.error('Search tracking error:', error);
      }
    }
  };

  const trackShopView = async (shopId: string) => {
    try {
      await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shopId,
          pageType: 'shop_detail'
        }),
      });
    } catch (error) {
      console.error('View tracking error:', error);
    }
  };

  const trackAdClick = async (campaignId: string, shopId: string) => {
    try {
      await fetch('/api/analytics/ad-click', { //ad click
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaignId,
          shopId,
          clickType: 'ad_banner'
        }),
      });
    } catch (error) {
      console.error('Ad click tracking error:', error);
    }
  };

  return (
    <>
      <Head>
        <title>ZabLink - แพลตฟอร์มรวมลิงก์ร้านอาหารครบครัน</title>
        <meta name="description" content="ค้นหาร้านอาหารใกล้คุณ พร้อมลิงก์สั่งอาหารจากทุกแพลตฟอร์ม LINE MAN, Grab Food, foodpanda และอื่นๆ" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Top Banner Ad */}
        {adCampaigns.bannerTop.length > 0 && (
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-2">
              {adCampaigns.bannerTop.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Link 
                    href={ad.banner_link_url}
                    onClick={() => trackAdClick(ad.id, ad.shop_name)}
                    className="inline-block"
                  >
                    <Image
                      src={ad.banner_image_url || '/images/ad-placeholder.jpg'}
                      alt={ad.banner_alt_text}
                      width={728}
                      height={90}
                      className="rounded-lg hover:shadow-md transition-shadow"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Z</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ZabLink</span>
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {session ? (
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/dashboard"
                      className="text-gray-700 hover:text-orange-600 font-medium"
                    >
                      แดชบอร์ด
                    </Link>
                    {session.user.role === 'shop' && (
                      <Link 
                        href="/shop/dashboard"
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        จัดการร้าน
                      </Link>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                      {session.user.avatar_url ? (
                        <Image
                          src={session.user.avatar_url}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm">
                          {session.user.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/auth/signin"
                      className="text-gray-700 hover:text-orange-600 font-medium"
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link 
                      href="/auth/register"
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                ค้นหาร้านอาหาร<br />ในบริเวณใกล้คุณ
              </h1>
              <p className="text-xl mb-8 text-orange-100">
                รวมลิงก์ร้านอาหารจากทุกแพลตฟอร์ม LINE MAN, Grab Food, foodpanda
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-full p-2 shadow-lg">
                  <div className="flex items-center">
                    <Search className="w-6 h-6 text-gray-400 ml-4" />
                    <input
                      type="text"
                      placeholder="ค้นหาร้านอาหาร, เมนู, หรือประเภทอาหาร..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="flex-1 px-4 py-3 text-gray-900 bg-transparent focus:outline-none"
                    />
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full transition-colors">
                      ค้นหา
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <main className="flex-1">
              {/* Food Categories */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">หมวดหมู่อาหาร</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
                  {foodCategories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedCategory === category.id
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-white hover:bg-orange-50 text-gray-700 shadow-md'
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                        <Image
                          src={category.icon_url || '/images/categories/default.png'}
                          alt={category.name_th}
                          width={24}
                          height={24}
                        />
                      </div>
                      <span className="text-sm font-medium">{category.name_th}</span>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Featured Shops */}
              {featuredShops.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">ร้านแนะนำ</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {featuredShops.map((shop, index) => (
                      <motion.div
                        key={shop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                      >
                        <ShopCard shop={shop} viewMode={viewMode} onView={trackShopView} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* All Shops */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    ร้านอาหารทั้งหมด
                    {searchQuery && (
                      <span className="text-base text-gray-600 font-normal ml-2">
                        ({filteredShops.length} ผลลัพธ์สำหรับ "{searchQuery}")
                      </span>
                    )}
                  </h2>
                  
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>

                {filteredShops.length > 0 ? (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredShops.map((shop, index) => (
                      <motion.div
                        key={shop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
                      >
                        <ShopCard shop={shop} viewMode={viewMode} onView={trackShopView} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ไม่พบร้านอาหาร
                    </h3>
                    <p className="text-gray-600">
                      ลองเปลี่ยนคำค้นหาหรือหมวดหมู่อาหาร
                    </p>
                  </div>
                )}
              </section>
            </main>

            {/* Sidebar */}
            <aside className="lg:w-80">
              {/* Floating Ad */}
              {adCampaigns.floatingRight.length > 0 && (
                <div className="sticky top-24 mb-6">
                  {adCampaigns.floatingRight.map((ad) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      <Link 
                        href={ad.banner_link_url}
                        onClick={() => trackAdClick(ad.id, ad.shop_name)}
                      >
                        <Image
                          src={ad.banner_image_url || '/images/ad-placeholder.jpg'}
                          alt={ad.banner_alt_text}
                          width={300}
                          height={250}
                          className="w-full h-auto hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">สถิติ ZabLink</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ร้านทั้งหมด</span>
                    <span className="font-semibold">{nearbyShops.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">หมวดหมู่</span>
                    <span className="font-semibold">{foodCategories.length}</span>
                  </div>
                  {session && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">คะแนนของคุณ</span>
                      <span className="font-semibold text-orange-600">0</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ลิงก์ด่วน</h3>
                <div className="space-y-2">
                  <Link 
                    href="/shops/register"
                    className="block w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>ลงทะเบียนร้านค้า</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                  <Link 
                    href="/ads/create"
                    className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>ลงโฆษณา</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                  <Link 
                    href="/about"
                    className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>เกี่ยวกับเรา</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer Banner Ad */}
        {adCampaigns.footerBanner.length > 0 && (
          <div className="bg-white border-t mt-12">
            <div className="container mx-auto px-4 py-6">
              {adCampaigns.footerBanner.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <Link 
                    href={ad.banner_link_url}
                    onClick={() => trackAdClick(ad.id, ad.shop_name)}
                    className="inline-block"
                  >
                    <Image
                      src={ad.banner_image_url || '/images/ad-placeholder.jpg'}
                      alt={ad.banner_alt_text}
                      width={728}
                      height={90}
                      className="rounded-lg hover:shadow-md transition-shadow"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">Z</span>
                  </div>
                  <span className="text-xl font-bold">ZabLink</span>
                </div>
                <p className="text-gray-400 text-sm">
                  แพลตฟอร์มรวมลิงก์ร้านอาหารครบครัน ค้นหา สั่ง และเพลิดเพลินกับอาหารอร่อย
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">สำหรับลูกค้า</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/search" className="hover:text-white">ค้นหาร้าน</Link></li>
                  <li><Link href="/categories" className="hover:text-white">หมวดหมู่อาหาร</Link></li>
                  <li><Link href="/favorites" className="hover:text-white">ร้านโปรด</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">สำหรับร้านค้า</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/shops/register" className="hover:text-white">ลงทะเบียนร้าน</Link></li>
                  <li><Link href="/packages" className="hover:text-white">แพ็คเกจ</Link></li>
                  <li><Link href="/ads" className="hover:text-white">ลงโฆษณา</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">ช่วยเหลือ</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/help" className="hover:text-white">วิธีใช้งาน</Link></li>
                  <li><Link href="/contact" className="hover:text-white">ติดต่อเรา</Link></li>
                  <li><Link href="/terms" className="hover:text-white">ข้อกำหนด</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">ความเป็นส่วนตัว</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 ZabLink. สงวนลิขสิทธิ์ทั้งหมด</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Shop Card Component
function ShopCard({ 
  shop, 
  viewMode, 
  onView 
}: { 
  shop: Shop; 
  viewMode: 'grid' | 'list';
  onView: (shopId: string) => void;
}) {
  const handleClick = () => {
    onView(shop.id);
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/shops/${shop.id}`} onClick={handleClick}>
        <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={shop.thumbnail_url || '/images/shop-placeholder.jpg'}
              alt={shop.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
            <p className="text-sm text-gray-600 truncate">{shop.description}</p>
            
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">
                  {shop.average_rating.toFixed(1)} ({shop.total_reviews})
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                {shop.distance_km && `${shop.distance_km} กม.`}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {shop.delivery_platforms.slice(0, 3).map((platform, index) => (
              <Image
                key={index}
                src={platform.logo_url}
                alt={platform.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded"
              />
            ))}
            {shop.delivery_platforms.length > 3 && (
              <span className="text-xs text-gray-500">+{shop.delivery_platforms.length - 3}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/shops/${shop.id}`} onClick={handleClick} className="block h-full">
      {/* Featured Badge */}
      {shop.priority_score > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            แนะนำ
          </span>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={shop.cover_image_url || '/images/shop-placeholder.jpg'}
          alt={shop.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1">{shop.name}</h3>
          <button className="text-gray-400 hover:text-red-500 ml-2">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{shop.description}</p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{shop.average_rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 ml-1">({shop.total_reviews})</span>
          </div>
          
          {shop.distance_km && (
            <div className="flex items-center ml-auto text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {shop.distance_km} กม.
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">
            {shop.subdistrict_name}, {shop.district_name}
          </span>
        </div>

        {/* Delivery Platforms */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {shop.delivery_platforms.slice(0, 4).map((platform, index) => (
              <Image
                key={index}
                src={platform.logo_url}
                alt={platform.name}
                width={20}
                height={20}
                className="w-5 h-5 rounded"
              />
            ))}
            {shop.delivery_platforms.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">
                +{shop.delivery_platforms.length - 4}
              </span>
            )}
          </div>
          
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {shop.food_category_name}
          </span>
        </div>
      </div>
    </Link>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const supabase = createClient();

    // Get featured shops (shops with packages > free)
    const { data: featuredShops } = await supabase
      .from('shops_with_location')
      .select(`
        *,
        shop_delivery_links(
          url,
          delivery_platforms(name, logo_url)
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .gt('priority_score', 0)
      .order('priority_score', { ascending: false })
      .limit(6);

    // Get all nearby shops (this should be based on user location in real app)
    const { data: nearbyShops } = await supabase
      .from('shops_with_location')
      .select(`
        *,
        shop_delivery_links(
          url,
          delivery_platforms(name, logo_url)
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get food categories
    const { data: foodCategories } = await supabase
      .from('food_categories')
      .select('id, name_th, icon_url')
      .eq('is_active', true)
      .order('sort_order');

    // Get active ad campaigns
    const { data: adCampaigns } = await supabase
      .from('active_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    // Group ads by zone
    const groupedAds = {
      bannerTop: adCampaigns?.filter(ad => ad.zone_name === 'banner-top') || [],
      floatingRight: adCampaigns?.filter(ad => ad.zone_name === 'floating-right') || [],
      footerBanner: adCampaigns?.filter(ad => ad.zone_name === 'footer-banner') || [],
    };

    return {
      props: {
        featuredShops: featuredShops || [],
        nearbyShops: nearbyShops || [],
        foodCategories: foodCategories || [],
        adCampaigns: groupedAds,
        userLocation: null, // TODO: Get from user preferences or geolocation
      },
    };
  } catch (error) {
    console.error('Homepage data fetch error:', error);
    
    return {
      props: {
        featuredShops: [],
        nearbyShops: [],
        foodCategories: [],
        adCampaigns: {
          bannerTop: [],
          floatingRight: [],
          footerBanner: [],
        },
        userLocation: null,
      },
    };
  }
};