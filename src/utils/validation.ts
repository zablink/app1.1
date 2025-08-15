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