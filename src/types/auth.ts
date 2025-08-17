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

export type AuthFormErrors = Partial<Record<keyof AuthFormData, string>>;
export type Provider = 'google' | 'facebook' | 'twitter' | 'github'
export type AuthView = 'signin' | 'signup'

export interface AuthError {
  message: string
  code?: string
}


