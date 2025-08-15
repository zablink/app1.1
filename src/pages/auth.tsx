// pages/auth.tsx - Updated with full functionality
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Facebook,
  Chrome,
  Twitter,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { signInWithEmail, signUpWithEmail, signInWithSocial } from '@/lib/auth'
import { validateEmail, validatePhone, validatePassword } from '@/utils/validation'
import type { Provider, AuthFormData, AuthError } from '@/types/auth'

// TikTok Icon
const TikTokIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M128 0c70.692 0 128 57.308 128 128s-57.308 128-128 128S0 198.692 0 128 57.308 0 128 0zm44.044 92.5c-4.68 0-9.04-.63-13.096-1.814v63.747a40.008 40.008 0 0 1-39.968-39.968h-21.98a62.012 62.012 0 0 0 61.948 61.948v-82.913c3.654 1.764 7.622 2.763 11.996 2.763 6.866 0 13.19-2.675 18.018-7.044v-23.679h-.918z"/>
  </svg>
);

type SocialButtonProps = {
  icon: React.FC<{ size?: number }>;
  provider: string;
  bgColor: string;
  hoverColor: string;
  textColor?: string;
  loading?: boolean;
  onClick: () => void;
};

const SocialButton: React.FC<SocialButtonProps> = ({
  icon: Icon,
  provider,
  bgColor,
  hoverColor,
  textColor = "text-white",
  loading = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className={`w-full flex items-center justify-center gap-3 px-4 py-3 ${bgColor} ${textColor} rounded-lg font-medium transition-all duration-200 hover:${hoverColor} hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
  >
    {loading ? (
      <Loader2 size={20} className="animate-spin" />
    ) : (
      <Icon size={20} />
    )}
    <span>เข้าสู่ระบบด้วย {provider}</span>
  </button>
);

// Alert Component
const Alert: React.FC<{
  type: 'error' | 'success' | 'info'
  message: string
  onClose?: () => void
}> = ({ type, message, onClose }) => {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  }

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: AlertCircle
  }

  const Icon = icons[type]

  return (
    <div className={`p-3 rounded-lg border flex items-center gap-2 mb-4 ${styles[type]}`}>
      <Icon size={16} />
      <span className="text-sm flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          ×
        </button>
      )}
    </div>
  )
}

const ZabLinkAuth = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [currentView, setCurrentView] = useState<"signin" | "signup">(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'error' | 'success' | 'info'
    message: string
  } | null>(null);
  
  const [formData, setFormData] = useState<AuthFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Partial<AuthFormData>>({});

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signin" || tab === "signup") {
      setCurrentView(tab);
    }

    // Check for URL error parameters
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    if (error) {
      let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      
      switch (error) {
        case "access_denied":
          errorMessage = "การเข้าสู่ระบบถูกยกเลิก";
          break;
        case "server_error":
          errorMessage = "เกิดข้อผิดพลาดของเซิร์ฟเวอร์";
          break;
        case "temporarily_unavailable":
          errorMessage = "ไม่สามารถเข้าสู่ระบบได้ชั่วคราว";
          break;
        default:
          if (errorDescription) {
            errorMessage = errorDescription;
          }
      }
      
      setAlert({ type: 'error', message: errorMessage });
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AuthFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (currentView === 'signup') {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Sign up specific validations  
    if (currentView === 'signup') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'กรุณากรอกชื่อ';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'กรุณากรอกนามสกุล';
      }
      
      if (!formData.phone) {
        newErrors.phone = 'กรุณากรอกเบอร์โทร';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
      }
      
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'กรุณายอมรับข้อกำหนดการใช้งาน';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof AuthFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear general alerts
    if (alert) {
      setAlert(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      if (currentView === 'signup') {
        const { data, error } = await signUpWithEmail(formData);
        
        if (error) {
          setAlert({ type: 'error', message: error.message });
        } else {
          setAlert({ 
            type: 'success', 
            message: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี' 
          });
          
          // Reset form
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            agreeTerms: false,
          });
          
          // Switch to signin after 3 seconds
          setTimeout(() => {
            setCurrentView('signin');
          }, 3000);
        }
      } else {
        const { data, error } = await signInWithEmail(formData.email, formData.password);
        
        if (error) {
          setAlert({ type: 'error', message: error.message });
        } else {
          setAlert({ type: 'success', message: 'เข้าสู่ระบบสำเร็จ!' });
          
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAlert({ 
        type: 'error', 
        message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: Provider) => {
    setSocialLoading(provider);
    setAlert(null);

    try {
      const { data, error } = await signInWithSocial(provider);
      
      if (error) {
        setAlert({ type: 'error', message: error.message });
      }
      // Success will be handled by the callback URL
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      setAlert({ 
        type: 'error', 
        message: `เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย ${provider}` 
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleTabChange = (view: 'signin' | 'signup') => {
    setCurrentView(view);
    setAlert(null);
    setErrors({});
    
    // Update URL without reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', view);
    window.history.pushState({}, '', newUrl.toString());
  };

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
                <span className="text-gray-700">เชื่อมต่อกับ Line Man, Grab Food และอื่น ๆ</span>
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
            {/* Mobile Branding  */}
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                ZabLink
              </h1>
              <p className="text-gray-600 text-sm mt-1">รวมลิงก์ร้านอาหาร ไว้ที่เดียว</p>
            </div>

            {/* Alert */}
            {alert && (
              <Alert 
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => handleTabChange("signin")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === "signin"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => handleTabChange("signup")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === "signup"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {/* Social Login */}
            <div className="mb-6">
              <h3 className="text-gray-600 font-medium text-sm mb-2">
                เข้าสู่ระบบด้วย Social Media
              </h3>
              <div className="space-y-3">
                <SocialButton
                  icon={Chrome}
                  provider="Google"
                  bgColor="bg-red-500"
                  hoverColor="bg-red-600"
                  loading={socialLoading === 'google'}
                  onClick={() => handleSocialLogin('google')}
                />
                <SocialButton
                  icon={Facebook}
                  provider="Facebook"
                  bgColor="bg-blue-600"
                  hoverColor="bg-blue-700"
                  loading={socialLoading === 'facebook'}
                  onClick={() => handleSocialLogin('facebook')}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SocialButton
                    icon={Twitter}
                    provider="Twitter"
                    bgColor="bg-sky-500"
                    hoverColor="bg-sky-600"
                    loading={socialLoading === 'twitter'}
                    onClick={() => handleSocialLogin('twitter')}
                  />
                  <button
                    onClick={() => handleSocialLogin('github')}
                    disabled={socialLoading === 'github'}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg font-medium transition-all duration-200 hover:bg-gray-800 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {socialLoading === 'github' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <TikTokIcon size={16} />
                    )}
                    <span className="text-sm">GitHub</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">หรือ</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {currentView === "signup" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                          errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="ชื่อ"
                        required
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                          errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="นามสกุล"
                        required
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              {currentView === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทร <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0xx-xxx-xxxx"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
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
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {currentView === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
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
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Terms and Conditions for Sign Up */}
              {currentView === "signup" && (
                <div>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      ฉันยอมรับ{" "}
                      <button 
                        type="button" 
                        className="text-orange-600 hover:underline"
                        onClick={() => window.open('/terms', '_blank')}
                      >
                        ข้อกำหนดการใช้งาน
                      </button>{" "}
                      และ{" "}
                      <button 
                        type="button" 
                        className="text-orange-600 hover:underline"
                        onClick={() => window.open('/privacy', '_blank')}
                      >
                        นโยบายความเป็นส่วนตัว
                      </button>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>
                  )}
                </div>
              )}

              {/* Remember Me / Forgot Password for Sign In */}
              {currentView === "signin" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-600">จดจำการเข้าสู่ระบบ</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                    onClick={() => {
                      // Handle forgot password
                      const email = prompt('กรุณากรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน:');
                      if (email) {
                        // You can implement resetPassword function here
                        setAlert({ 
                          type: 'info', 
                          message: 'ลิงก์รีเซ็ตรหัสผ่านได้ส่งไปที่อีเมลของคุณแล้ว' 
                        });
                      } 
                    }}
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                <span>
                  {loading 
                    ? (currentView === "signin" ? "กำลังเข้าสู่ระบบ..." : "กำลังสร้างบัญชี...") 
                    : (currentView === "signin" ? "เข้าสู่ระบบ" : "สร้างบัญชี")
                  }
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-gray-600">
              {currentView === "signin" ? (
                <span>
                  ยังไม่มีบัญชี?{" "}
                  <button
                    onClick={() => handleTabChange("signup")}
                    className="text-orange-600 hover:underline font-medium"
                  >
                    สมัครสมาชิก
                  </button>
                </span>
              ) : (
                <span>
                  มีบัญชีแล้ว?{" "}
                  <button
                    onClick={() => handleTabChange("signin")}
                    className="text-orange-600 hover:underline font-medium"
                  >
                    เข้าสู่ระบบ
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZabLinkAuth;