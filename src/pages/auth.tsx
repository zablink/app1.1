// pages/auth.tsx

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Facebook, Chrome, Twitter } from 'lucide-react';

const ZabLinkAuth = () => {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false
  });

  // สำหรับ input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // สำหรับ select
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // สำหรับ textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Handle social login logic here
  };

  const SocialButton = ({ icon: Icon, provider, bgColor, hoverColor, textColor = "text-white" }) => (
    <button
      onClick={() => handleSocialLogin(provider)}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 ${bgColor} ${textColor} rounded-lg font-medium transition-all duration-200 hover:${hoverColor} hover:scale-105 hover:shadow-md`}
    >
      <Icon size={20} />
      <span>เข้าสู่ระบบด้วย {provider}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center space-y-8 px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-4">
              ZabLink
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              รวมลิงก์ร้านอาหาร ทุกแพลตฟอร์ม ไว้ที่เดียว
            </p>
            <div className="space-y-4 text-left max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                <span className="text-gray-700">เชื่อมต่อกับ Line Man, Grab Food และอื่นๆ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                <span className="text-gray-700">ลงโฆษณาตามพื้นที่ที่ต้องการ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                <span className="text-gray-700">จัดการร้านค้าได้ง่ายๆ ในที่เดียว</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            
            {/* Mobile Branding */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                ZabLink
              </h1>
              <p className="text-gray-600 text-sm mt-1">รวมลิงก์ร้านอาหาร ไว้ที่เดียว</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setCurrentView('signin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === 'signin'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => setCurrentView('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === 'signup'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <SocialButton 
                icon={Chrome} 
                provider="Google" 
                bgColor="bg-red-500" 
                hoverColor="bg-red-600"
              />
              <SocialButton 
                icon={Facebook} 
                provider="Facebook" 
                bgColor="bg-blue-600" 
                hoverColor="bg-blue-700"
              />
              <div className="grid grid-cols-2 gap-3">
                <SocialButton 
                  icon={Twitter} 
                  provider="Twitter" 
                  bgColor="bg-black" 
                  hoverColor="bg-gray-800"
                />
                <button
                  onClick={() => handleSocialLogin('TikTok')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-medium transition-all duration-200 hover:bg-gray-800 hover:scale-105 hover:shadow-md"
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-sm">TikTok</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">หรือ</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              
              {/* Sign Up Fields */}
              {currentView === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อ
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="ชื่อ"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        นามสกุล
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          placeholder="นามสกุล"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เบอร์โทร
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                        placeholder="เบอร์โทรศัพท์"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="อีเมล"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="รหัสผ่าน"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password for Sign Up */}
              {currentView === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder="ยืนยันรหัสผ่าน"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between">
                {currentView === 'signin' ? (
                  <>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0"
                      />
                      <span className="ml-2 text-sm text-gray-600">จดจำการเข้าสู่ระบบ</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </>
                ) : (
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 mt-1"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      ฉันยอมรับ <button type="button" className="text-orange-600 hover:underline">ข้อกำหนดการใช้งาน</button> และ <button type="button" className="text-orange-600 hover:underline">นโยบายความเป็นส่วนตัว</button>
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
              >
                {currentView === 'signin' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
              </button>
            </form>

            {/* Footer Text */}
            <div className="text-center mt-6 text-sm text-gray-600">
              {currentView === 'signin' ? (
                <span>ยังไม่มีบัญชี? <button onClick={() => setCurrentView('signup')} className="text-orange-600 hover:underline font-medium">สมัครสมาชิก</button></span>
              ) : (
                <span>มีบัญชีแล้ว? <button onClick={() => setCurrentView('signin')} className="text-orange-600 hover:underline font-medium">เข้าสู่ระบบ</button></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZabLinkAuth;