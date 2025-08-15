// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// types/auth.ts
export interface AuthFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  agreeTerms: boolean
}

export type Provider = 'google' | 'facebook' | 'twitter' | 'github'
export type AuthView = 'signin' | 'signup'

export interface AuthError {
  message: string
  code?: string
}
 
// lib/auth.ts
import { supabase } from './supabase'
import type { Provider, AuthFormData, AuthError } from '@/types/auth'

// Email Sign Up
export const signUpWithEmail = async (formData: AuthFormData) => {
  try {
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      throw new Error('รหัสผ่านไม่ตรงกัน')
    }

    // Validate password strength
    if (formData.password.length < 6) {
      throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          full_name: `${formData.firstName} ${formData.lastName}`,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return { 
      data: null, 
      error: { 
        message: error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
        code: error.code
      } 
    }
  }
}

// Email Sign In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    console.error('Sign in error:', error)
    
    let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    
    switch (error.code) {
      case 'invalid_credentials':
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        break
      case 'email_not_confirmed':
        errorMessage = 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
        break
      case 'too_many_requests':
        errorMessage = 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่'
        break
      default:
        errorMessage = error.message || errorMessage
    }

    return { 
      data: null, 
      error: { 
        message: errorMessage,
        code: error.code
      } 
    }
  }
}

// Social Login
export const signInWithSocial = async (provider: Provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    console.error(`${provider} login error:`, error)
    
    let errorMessage = `เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย ${provider}`
    
    switch (error.code) {
      case 'oauth_callback_confirm':
        errorMessage = 'การเชื่อมต่อ Social Media ไม่สำเร็จ'
        break
      case 'email_address_invalid':
        errorMessage = 'อีเมลจาก Social Media ไม่ถูกต้อง'
        break
      default:
        errorMessage = error.message || errorMessage
    }

    return { 
      data: null, 
      error: { 
        message: errorMessage,
        code: error.code
      } 
    }
  }
}

// Sign Out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Sign out error:', error)
    return { 
      error: { 
        message: 'เกิดข้อผิดพลาดในการออกจากระบบ',
        code: error.code
      } 
    }
  }
}

// Get Current User
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error: any) {
    console.error('Get user error:', error)
    return { 
      user: null, 
      error: { 
        message: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
        code: error.code
      } 
    }
  }
}

// Reset Password
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    console.error('Reset password error:', error)
    return { 
      data: null, 
      error: { 
        message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
        code: error.code
      } 
    }
  }
}

// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/auth-helpers-nextjs'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email)
            break
          case 'SIGNED_OUT':
            console.log('User signed out')
            break
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed')
            break
          case 'USER_UPDATED':
            console.log('User updated')
            break
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  }
}

// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  // Thai phone number validation
  const phoneRegex = /^(\+66|66|0)([0-9]{8,9})$/
  return phoneRegex.test(phone.replace(/\s|-/g, ''))
}

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('รหัสผ่านต้องมีตัวอักษร')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('รหัสผ่านต้องมีตัวเลข')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as XXX-XXX-XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}