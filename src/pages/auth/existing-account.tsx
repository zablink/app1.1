// src/pages/auth/existing-account.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Chrome, 
  Facebook, 
  Twitter, 
  Music, 
  Mail 
} from 'lucide-react';

export default function ExistingAccountPage() {
  const router = useRouter();
  const { email, provider } = router.query;
  const [isLoading, setIsLoading] = useState(false);

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google': return <Chrome className="w-6 h-6" />;
      case 'facebook': return <Facebook className="w-6 h-6" />;
      case 'twitter': return <Twitter className="w-6 h-6" />;
      case 'tiktok': return <Music className="w-6 h-6" />;
      case 'email': return <Mail className="w-6 h-6" />;
      default: return <Mail className="w-6 h-6" />;
    }
  };

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      case 'twitter': return 'Twitter/X';
      case 'tiktok': return 'TikTok';
      case 'email': return 'อีเมล';
      default: return providerId;
    }
  };

  const getProviderColor = (providerId: string) => {
    switch (providerId) {
      case 'google': return 'bg-red-500 hover:bg-red-600';
      case 'facebook': return 'bg-blue-600 hover:bg-blue-700';
      case 'twitter': return 'bg-black hover:bg-gray-800';
      case 'tiktok': return 'bg-black hover:bg-gray-900';
      case 'email': return 'bg-gray-600 hover:bg-gray-700';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const handleSignInWithProvider = async () => {
    if (!provider || typeof provider !== 'string') return;
    
    setIsLoading(true);
    try {
      await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || typeof email !== 'string') return;
    
    setIsLoading(true);
    try {
      const result = await signIn('email', {
        email,
        callbackUrl: '/dashboard',
        redirect: false,
      });
      
      if (result?.ok) {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Email sign in error:', error);
      setIsLoading(false);
    }
  };

  if (!email || !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ข้อมูลไม่ครบถ้วน</p>
          <Link href="/auth/signin" className="text-orange-600 hover:text-orange-700">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>บัญชีผู้ใช้มีอยู่แล้ว - ZabLink</title>
        <meta name="description" content="อีเมลนี้ถูกใช้กับวิธีการเข้าสู่ระบบอื่นแล้ว" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/auth/signin" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              บัญชีผู้ใช้มีอยู่แล้ว
            </h1>

            {/* Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-center">
                อีเมล <strong>{email}</strong> ถูกใช้กับวิธีการเข้าสู่ระบบอื่นแล้ว
              </p>
            </div>

            {/* Provider Button */}
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-4">
                กรุณาเข้าสู่ระบบด้วยวิธีที่เคยใช้:
              </p>

              {provider === 'email' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmailSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Mail className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div>เข้าสู่ระบบด้วยอีเมล</div>
                    <div className="text-sm opacity-90">{email}</div>
                  </div>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignInWithProvider}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-4 py-4 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${getProviderColor(provider as string)}`}
                >
                  {getProviderIcon(provider as string)}
                  <div className="ml-3 text-left">
                    <div>เข้าสู่ระบบด้วย {getProviderName(provider as string)}</div>
                    <div className="text-sm opacity-90">{email}</div>
                  </div>
                </motion.button>
              )}

              {isLoading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                </div>
              )}
            </div>

            {/* Alternative Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-3 text-center">
                <p className="text-sm text-gray-600">
                  หรือคุณสามารถ:
                </p>
                
                <div className="space-y-2">
                  <Link 
                    href="/auth/signin"
                    className="block text-sm text-orange-600 hover:text-orange-700"
                  >
                    ใช้อีเมลอื่น
                  </Link>
                  
                  <Link 
                    href="/support/forgot-provider"
                    className="block text-sm text-gray-500 hover:text-gray-700"
                  >
                    ลืมวิธีการเข้าสู่ระบบ?
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ต้องการความช่วยเหลือ?{' '}
              <Link href="/support" className="text-orange-600 hover:text-orange-700">
                ติดต่อทีมสนับสนุน
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}