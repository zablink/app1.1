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
                              value={formData.subdist