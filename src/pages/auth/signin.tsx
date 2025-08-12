// src/pages/auth/signin.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn, getProviders, ClientSafeProvider } from 'next-auth/react';
import { authOptions } from '../api/auth/[...nextauth]';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Chrome, 
  Facebook, 
  Twitter, 
  Music, 
  Eye, 
  EyeOff,
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';

interface SignInPageProps {
  providers: Record<string, ClientSafeProvider>;
  csrfToken: string;
  error?: string;
  callbackUrl?: string;
}

export default function SignInPage({ 
  providers, 
  csrfToken, 
  error,
  callbackUrl = '/' 
}: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailProviders, setEmailProviders] = useState<any[]>([]);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // ตรวจสอบ email ว่าเคยใช้กับ provider อื่นหรือไม่
  const checkEmailProviders = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setCheckingEmail(true);
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setEmailProviders(data.providers || []);
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Debounce email check
  useEffect(() => {
    if (email.includes('@')) {
      const timer = setTimeout(() => {
        checkEmailProviders(email);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEmailProviders([]);
    }
  }, [email]);

  const handleSocialSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { callbackUrl });
    } catch (error) {
      console.error('Social sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      });
      
      if (result?.ok) {
        // Redirect to verify page
        window.location.href = '/auth/verify?email=' + encodeURIComponent(email);
      }
    } catch (error) {
      console.error('Email sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google': return <Chrome className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'tiktok': return <Music className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      default: return null;
    }
  };

  const getProviderColor = (providerId: string) => {
    switch (providerId) {
      case 'google': return 'bg-red-500 hover:bg-red-600';
      case 'facebook': return 'bg-blue-600 hover:bg-blue-700';
      case 'twitter': return 'bg-blue-400 hover:bg-blue-500';
      case 'tiktok': return 'bg-black hover:bg-gray-800';
      case 'email': return 'bg-gray-600 hover:bg-gray-700';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      case 'twitter': return 'Twitter';
      case 'tiktok': return 'TikTok';
      case 'email': return 'อีเมล';
      default: return providerId;
    }
  };

  return (
    <>
      <Head>
        <title>เข้าสู่ระบบ | ชื่อเว็บ</title>
        <meta name="description" content="เข้าสู่ระบบเพื่อใช้งานเว็บไซต์" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            กลับหน้าหลัก
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                เข้าสู่ระบบ
              </h1>
              <p className="text-gray-600">
                เลือกวิธีการเข้าสู่ระบบที่คุณต้องการ
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">เกิดข้อผิดพลาด</p>
                    <p className="text-red-600 text-sm mt-1">
                      {error === 'OAuthCallback' && 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง'}
                      {error === 'AccessDenied' && 'การเข้าถึงถูกปฏิเสธ'}
                      {error === 'Verification' && 'โทเค็นการยืนยันไม่ถูกต้อง'}
                      {!['OAuthCallback', 'AccessDenied', 'Verification'].includes(error) && error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Social Login Buttons */}
            {!showEmailForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 mb-6"
              >
                {Object.values(providers)
                  .filter(provider => provider.id !== 'email')
                  .map((provider, index) => (
                  <motion.button
                    key={provider.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    onClick={() => handleSocialSignIn(provider.id)}
                    disabled={isLoading}
                    className={`w-full ${getProviderColor(provider.id)} text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl`}
                  >
                    {getProviderIcon(provider.id)}
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      `เข้าสู่ระบบด้วย ${getProviderName(provider.id)}`
                    )}
                  </motion.button>
                ))}
                
                {/* Email Provider Button */}
                {providers.email && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => setShowEmailForm(true)}
                    disabled={isLoading}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-5 h-5" />
                    เข้าสู่ระบบด้วยอีเมล
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Email Form */}
            {showEmailForm && providers.email && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
                  <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="กรอกอีเมลของคุณ"
                      />
                      {checkingEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Email Provider Suggestions */}
                    {emailProviders.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <p className="text-sm text-yellow-800 mb-2">
                          อีเมลนี้เคยใช้เข้าสู่ระบบด้วย:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {emailProviders.map((provider) => (
                            <button
                              key={provider}
                              type="button"
                              onClick={() => handleSocialSignIn(provider)}
                              className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full transition-colors"
                            >
                              {getProviderName(provider)}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        ส่งลิงก์เข้าสู่ระบบ
                      </>
                    )}
                  </button>
                </form>

                <button
                  onClick={() => setShowEmailForm(false)}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
                >
                  ← กลับไปเลือกวิธีการเข้าสู่ระบบ
                </button>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-gray-600"
            >
              <p>
                ยังไม่มีบัญชี?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs">
                  การเข้าสู่ระบบแสดงว่าคุณยอมรับ{' '}
                  <Link href="/terms" className="text-blue-500 hover:underline">
                    ข้อกำหนดการใช้งาน
                  </Link>{' '}
                  และ{' '}
                  <Link href="/privacy" className="text-blue-500 hover:underline">
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Redirect if already signed in
  if (session) {
    return {
      redirect: {
        destination: context.query.callbackUrl as string || '/',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();
  const { error } = context.query;
  
  return {
    props: {
      providers: providers ?? {},
      csrfToken: '', // You might want to generate a proper CSRF token
      error: error || null,
      callbackUrl: context.query.callbackUrl || '/',
    },
  };
};