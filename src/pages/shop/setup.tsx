// src/pages/shops/setup.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import { authOptions } from '../api/auth/[...nextauth]';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  MapPin,
  Camera,
  Link as LinkIcon,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  Phone,
  Clock,
  Star,
  ChevronDown
} from 'lucide-react';

interface Location {
  provinces: Array<{ id: number; name_th: string; }>;
  districts: Array<{ id: number; name_th: string; province_id: number; }>;
  subdistricts: Array<{ id: number; name_th: string; district_id: number; }>;
}

interface FoodCategory {
  id: number;
  name_th: string;
  icon_url: string;
}

interface DeliveryPlatform {
  id: number;
  name: string;
  logo_url: string;
}

interface SetupProps {
  locations: Location;
  foodCategories: FoodCategory[];
  deliveryPlatforms: DeliveryPlatform[];
}

export default function ShopSetup({ locations, foodCategories, deliveryPlatforms }: SetupProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    description: '',
    foodCategoryId: '',
    
    // Step 2: Location
    provinceId: '',
    districtId: '',
    subdistrictId: '',
    addressDetail: '',
    
    // Step 3: Contact & Hours
    phone: '',
    lineId: '',
    facebookUrl: '',
    instagramUrl: '',
    websiteUrl: '',
    openingHours: {
      monday: { open: '09:00', close: '21:00', closed: false },
      tuesday: { open: '09:00', close: '21:00', closed: false },
      wednesday: { open: '09:00', close: '21:00', closed: false },
      thursday: { open: '09:00', close: '21:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '09:00', close: '21:00', closed: false },
      sunday: { open: '09:00', close: '21:00', closed: false },
    },
    
    // Step 4: Images
    coverImage: null as File | null,
    thumbnailImage: null as File | null,
    logoImage: null as File | null,
    
    // Step 5: Delivery Links
    deliveryLinks: [] as Array<{ platformId: string; url: string; }>
  });

  // Filter districts and subdistricts based on selection
  const filteredDistricts = locations.districts.filter(d => d.province_id === parseInt(formData.provinceId));
  const filteredSubdistricts = locations.subdistricts.filter(s => s.district_id === parseInt(formData.districtId));

  const steps = [
    { id: 1, title: 'ข้อมูลพื้นฐาน', icon: Store },
    { id: 2, title: 'ที่อยู่', icon: MapPin },
    { id: 3, title: 'ติดต่อ & เวลา', icon: Phone },
    { id: 4, title: 'รูปภาพ', icon: Camera },
    { id: 5, title: 'ลิงก์สั่งอาหาร', icon: LinkIcon },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageUpload = (field: 'coverImage' | 'thumbnailImage' | 'logoImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // สร้าง FormData สำหรับอัพโหลดรูปภาพ
      const uploadData = new FormData();
      uploadData.append('shopData', JSON.stringify(formData));
      
      if (formData.coverImage) uploadData.append('coverImage', formData.coverImage);
      if (formData.thumbnailImage) uploadData.append('thumbnailImage', formData.thumbnailImage);
      if (formData.logoImage) uploadData.append('logoImage', formData.logoImage);

      const response = await fetch('/api/shops/create', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/shops/${result.shopId}?setup=complete`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Shop creation error:', error);
      alert('เกิดข้อผิดพลาดในการสร้างร้าน');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description && formData.foodCategoryId;
      case 2:
        return formData.subdistrictId && formData.addressDetail;
      case 3:
        return formData.phone;
      case 4:
        return true; // Images are optional
      case 5:
        return formData.deliveryLinks.length > 0;
      default:
        return false;
    }
  };

  if (!session || session.user.role !== 'shop') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">คุณต้องเป็นร้านค้าเพื่อเข้าถึงหน้านี้</p>
          <Link 
            href="/dashboard"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            กลับไปแดชบอร์ด
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>ตั้งค่าร้านค้า - ZabLink</title>
        <meta name="description" content="ตั้งค่าร้านอาหารของคุณใน ZabLink" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Z</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ZabLink</span>
              </Link>

              <div className="flex items-center space-x-4">
                <span className="text-gray-600">ตั้งค่าร้านค้า</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">ขั้นตอน {currentStep}/5</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                      currentStep === step.id
                        ? 'border-orange-600 bg-orange-600 text-white'
                        : currentStep > step.id
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 md:w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ข้อมูลพื้นฐานของร้าน</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อร้าน *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ป้อนชื่อร้านอาหารของคุณ"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          คำอธิบายร้าน *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="อธิบายร้านของคุณ อาหารแนะนำ จุดเด่น..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ประเภทอาหาร *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {foodCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, foodCategoryId: category.id.toString() }))}
                              className={`p-4 rounded-lg border text-center transition-all ${
                                formData.foodCategoryId === category.id.toString()
                                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
                              }`}
                            >
                              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                                <Image
                                  src={category.icon_url || '/images/categories/default.png'}
                                  alt={category.name_th}
                                  width={24}
                                  height={24}
                                />
                              </div>
                              <span className="text-sm font-medium">{category.name_th}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ที่อยู่ร้าน</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Province */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            จังหวัด *
                          </label>
                          <div className="relative">
                            <select
                              value={formData.provinceId}
                              onChange={(e) => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  provinceId: e.target.value,
                                  districtId: '',
                                  subdistrictId: ''
                                }));
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                            >
                              <option value="">เลือกจังหวัด</option>
                              {locations.provinces.map((province) => (
                                <option key={province.id} value={province.id}>
                                  {province.name_th}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* District */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            อำเภอ *
                          </label>
                          <div className="relative">
                            <select
                              value={formData.districtId}
                              onChange={(e) => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  districtId: e.target.value,
                                  subdistrictId: ''
                                }));
                              }}
                              disabled={!formData.provinceId}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none disabled:bg-gray-100"
                            >
                              <option value="">เลือกอำเภอ</option>
                              {filteredDistricts.map((district) => (
                                <option key={district.id} value={district.id}>
                                  {district.name_th}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Subdistrict */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ตำบล *
                          </label>
                          <div className="relative">
                            <select
                              value={formData.subdistrictId}
                              onChange={(e) => setFormData(prev => ({ ...prev, subdistrictId: e.target.value }))}
                              disabled={!formData.districtId}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none disabled:bg-gray-100"
                            >
                              <option value="">เลือกตำบล</option>
                              {filteredSubdistricts.map((subdistrict) => (
                                <option key={subdistrict.id} value={subdistrict.id}>
                                  {subdistrict.name_th}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ที่อยู่รายละเอียด *
                        </label>
                        <textarea
                          value={formData.addressDetail}
                          onChange={(e) => setFormData(prev => ({ ...prev, addressDetail: e.target.value }))}
                          placeholder="เลขที่ ซอย ถนน หรือรายละเอียดที่อยู่เพิ่มเติม"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Contact & Hours */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ข้อมูลติดต่อและเวลาทำการ</h2>
                    
                    <div className="space-y-6">
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            เบอร์โทรศัพท์ *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="08x-xxx-xxxx"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LINE ID
                          </label>
                          <input
                            type="text"
                            value={formData.lineId}
                            onChange={(e) => setFormData(prev => ({ ...prev, lineId: e.target.value }))}
                            placeholder="@your-line-id"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook
                          </label>
                          <input
                            type="url"
                            value={formData.facebookUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                            placeholder="https://facebook.com/your-page"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram
                          </label>
                          <input
                            type="url"
                            value={formData.instagramUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                            placeholder="https://instagram.com/your-account"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Opening Hours */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">เวลาทำการ</h3>
                        <div className="space-y-3">
                          {Object.entries(formData.openingHours).map(([day, hours]) => {
                            const dayNames: Record<string, string> = {
                              monday: 'จันทร์',
                              tuesday: 'อังคาร', 
                              wednesday: 'พุธ',
                              thursday: 'พฤหัสบดี',
                              friday: 'ศุกร์',
                              saturday: 'เสาร์',
                              sunday: 'อาทิตย์'
                            };

                            return (
                              <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                                <div className="w-20 text-sm font-medium text-gray-700">
                                  {dayNames[day]}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={!hours.closed}
                                    onChange={(e) => {
                                      setFormData(prev => ({
                                        ...prev,
                                        openingHours: {
                                          ...prev.openingHours,
                                          [day]: { ...hours, closed: !e.target.checked }
                                        }
                                      }));
                                    }}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-gray-600">เปิด</span>
                                </div>

                                {!hours.closed && (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="time"
                                      value={hours.open}
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          openingHours: {
                                            ...prev.openingHours,
                                            [day]: { ...hours, open: e.target.value }
                                          }
                                        }));
                                      }}
                                      className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                      type="time"
                                      value={hours.close}
                                      onChange={(e) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          openingHours: {
                                            ...prev.openingHours,
                                            [day]: { ...hours, close: e.target.value }
                                          }
                                        }));
                                      }}
                                      className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                  </div>
                                )}

                                {hours.closed && (
                                  <span className="text-sm text-gray-500">ปิด</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Images */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">รูปภาพร้าน</h2>
                    
                    <div className="space-y-6">
                      {/* Cover Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          รูปหน้าปกร้าน (แนะนำ)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload('coverImage')}
                            className="hidden"
                            id="cover-upload"
                          />
                          <label htmlFor="cover-upload" className="cursor-pointer">
                            {formData.coverImage ? (
                              <div>
                                <Image
                                  src={URL.createObjectURL(formData.coverImage)}
                                  alt="Cover preview"
                                  width={200}
                                  height={100}
                                  className="mx-auto rounded-lg mb-2"
                                />
                                <p className="text-sm text-gray-600">{formData.coverImage.name}</p>
                              </div>
                            ) : (
                              <div>
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">คลิกเพื่ออัพโหลดรูปหน้าปก</p>
                                <p className="text-xs text-gray-500 mt-1">ขนาดแนะนำ: 1200x600 px</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Thumbnail & Logo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            รูปโปรไฟล์ร้าน
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload('thumbnailImage')}
                              className="hidden"
                              id="thumbnail-upload"
                            />
                            <label htmlFor="thumbnail-upload" className="cursor-pointer">
                              {formData.thumbnailImage ? (
                                <div>
                                  <Image
                                    src={URL.createObjectURL(formData.thumbnailImage)}
                                    alt="Thumbnail preview"
                                    width={100}
                                    height={100}
                                    className="mx-auto rounded-lg mb-2"
                                  />
                                  <p className="text-xs text-gray-600">{formData.thumbnailImage.name}</p>
                                </div>
                              ) : (
                                <div>
                                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">รูปโปรไฟล์</p>
                                  <p className="text-xs text-gray-500">400x400 px</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            โลโก้ร้าน
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload('logoImage')}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label htmlFor="logo-upload" className="cursor-pointer">
                              {formData.logoImage ? (
                                <div>
                                  <Image
                                    src={URL.createObjectURL(formData.logoImage)}
                                    alt="Logo preview"
                                    width={100}
                                    height={100}
                                    className="mx-auto rounded-lg mb-2"
                                  />
                                  <p className="text-xs text-gray-600">{formData.logoImage.name}</p>
                                </div>
                              ) : (
                                <div>
                                  <Store className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">โลโก้ร้าน</p>
                                  <p className="text-xs text-gray-500">200x200 px</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Delivery Links */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ลิงก์สั่งอาหาร</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-blue-900">สำคัญ!</h3>
                            <p className="text-sm text-blue-800">
                              เพิ่มลิงก์ร้านของคุณจากแพลตฟอร์มต่างๆ เช่น LINE MAN, Grab Food เพื่อให้ลูกค้าสั่งอาหารได้ง่าย
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Links */}
                      <div className="space-y-4">
                        {deliveryPlatforms.map((platform) => {
                          const existingLink = formData.deliveryLinks.find(link => link.platformId === platform.id.toString());
                          
                          return (
                            <div key={platform.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                              <div className="flex items-center space-x-3 flex-1">
                                <Image
                                  src={platform.logo_url}
                                  alt={platform.name}
                                  width={40}
                                  height={40}
                                  className="rounded-lg"
                                />
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{platform.name}</h3>
                                  <input
                                    type="url"
                                    value={existingLink?.url || ''}
                                    onChange={(e) => {
                                      const newLinks = formData.deliveryLinks.filter(link => link.platformId !== platform.id.toString());
                                      if (e.target.value) {
                                        newLinks.push({ platformId: platform.id.toString(), url: e.target.value });
                                      }
                                      setFormData(prev => ({ ...prev, deliveryLinks: newLinks }));
                                    }}
                                    placeholder={`ลิงก์ร้านใน ${platform.name}`}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                  />
                                </div>
                              </div>
                              
                              {existingLink && (
                                <div className="flex-shrink-0">
                                  <Check className="w-5 h-5 text-green-500" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {formData.deliveryLinks.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="font-semibold text-gray-900 mb-2">
                            เพิ่มลิงก์แรกของคุณ
                          </h3>
                          <p className="text-gray-600 text-sm">
                            เพิ่มลิงก์จากแพลตฟอร์มต่างๆ เพื่อให้ลูกค้าสั่งอาหารได้
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div>
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>ย้อนกลับ</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    ขั้นตอน {currentStep} จาก {steps.length}
                  </span>
                  
                  {currentStep < 5 ? (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      <span>ถัดไป</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceed() || isSubmitting}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>กำลังสร้างร้าน...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>สร้างร้าน</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
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
        destination: '/auth/signin?callbackUrl=/shops/setup',
        permanent: false,
      },
    };
  }

  if (session.user.role !== 'shop') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  try {
    // Mock data - replace with real Supabase calls
    const mockData = {
      locations: {
        provinces: [
          { id: 1, name_th: 'กรุงเทพมหานคร' },
          { id: 2, name_th: 'นนทบุรี' },
          { id: 3, name_th: 'ปทุมธานี' },
          { id: 4, name_th: 'สมุทรปราการ' },
          { id: 5, name_th: 'เชียงใหม่' },
          { id: 6, name_th: 'ภูเก็ต' },
        ],
        districts: [
          { id: 1, name_th: 'บางรัก', province_id: 1 },
          { id: 2, name_th: 'ปทุมวัน', province_id: 1 },
          { id: 3, name_th: 'สาทร', province_id: 1 },
          { id: 4, name_th: 'คลองเตย', province_id: 1 },
          { id: 5, name_th: 'วัฒนา', province_id: 1 },
        ],
        subdistricts: [
          { id: 1, name_th: 'บางรัก', district_id: 1 },
          { id: 2, name_th: 'สีลม', district_id: 1 },
          { id: 3, name_th: 'ปทุมวัน', district_id: 2 },
          { id: 4, name_th: 'ลุมพินี', district_id: 2 },
          { id: 5, name_th: 'สาทร', district_id: 3 },
        ],
      },
      foodCategories: [
        { id: 1, name_th: 'อาหารไทย', icon_url: '/images/categories/thai.png' },
        { id: 2, name_th: 'อาหารจีน', icon_url: '/images/categories/chinese.png' },
        { id: 3, name_th: 'อาหารญี่ปุ่น', icon_url: '/images/categories/japanese.png' },
        { id: 4, name_th: 'อาหารเกาหลี', icon_url: '/images/categories/korean.png' },
        { id: 5, name_th: 'อาหารฝรั่ง', icon_url: '/images/categories/western.png' },
      ],
      deliveryPlatforms: [
        { id: 1, name: 'LINE MAN', logo_url: '/images/platforms/lineman.png' },
        { id: 2, name: 'Grab Food', logo_url: '/images/platforms/grab.png' },
        { id: 3, name: 'foodpanda', logo_url: '/images/platforms/foodpanda.png' },
        { id: 4, name: 'Robinhood', logo_url: '/images/platforms/robinhood.png' },
        { id: 5, name: 'GET Food', logo_url: '/images/platforms/get.png' },
      ],
    };

    return {
      props: mockData,
    };
  } catch (error) {
    console.error('Shop setup data fetch error:', error);
    
    return {
      props: {
        locations: { provinces: [], districts: [], subdistricts: [] },
        foodCategories: [],
        deliveryPlatforms: [],
      },
    };
  }
};