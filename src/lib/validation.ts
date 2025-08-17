// lib/validation.ts
import { AuthFormData, AuthFormErrors } from '@/types/auth';

export function validateAuthForm(formData: AuthFormData): AuthFormErrors {
  const errors: AuthFormErrors = {};

  // First name
  if (!formData.firstName.trim()) {
    errors.firstName = 'กรุณากรอกชื่อ';
  }

  // Last name
  if (!formData.lastName.trim()) {
    errors.lastName = 'กรุณากรอกนามสกุล';
  }

  // Email
  if (!formData.email.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  // Password
  if (!formData.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  } else if (formData.password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  }

  // Confirm password
  if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
  }

  // Phone
  if (!formData.phone.trim()) {
    errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
  } else if (!/^[0-9]{10}$/.test(formData.phone)) {
    errors.phone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก';
  }

  // Agree terms
  if (!formData.agreeTerms) {
    errors.agreeTerms = 'กรุณายอมรับข้อกำหนดการใช้งาน';
  }

  return errors;
}
