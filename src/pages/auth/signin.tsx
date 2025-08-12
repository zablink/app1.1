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
      case 'facebook':