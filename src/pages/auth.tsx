// pages/auth.tsx

import React, { useState } from "react";
import { Chrome, Facebook, Twitter } from "lucide-react"; // ไอคอนจาก lucide-react

// 🔹 type สำหรับ provider
type Provider = "Google" | "Facebook" | "Twitter" | "TikTok";

// 🔹 ฟังก์ชันจัดการ submit
const handleSubmit = (e: React.FormEvent<HTMLFormElement>, formData: any) => {
  e.preventDefault();
  console.log("Form submitted:", formData);
};

// 🔹 ฟังก์ชันจัดการ social login
const handleSocialLogin = (provider: Provider) => {
  console.log(`Login with ${provider}`);
};

// 🔹 type ของ props สำหรับ SocialButton
import { LucideIcon } from "lucide-react";

type SocialButtonProps = {
  icon: LucideIcon;
  provider: Provider;
  bgColor: string;
  hoverColor: string;
  textColor?: string;
};

const SocialButton: React.FC<SocialButtonProps> = ({
  icon: Icon,
  provider,
  bgColor,
  hoverColor,
  textColor = "text-white",
}) => (
  <button
    type="button"
    onClick={() => handleSocialLogin(provider)}
    className={`w-full flex items-center justify-center gap-3 px-4 py-3 ${bgColor} ${textColor} rounded-lg font-medium transition-all duration-200 hover:${hoverColor} hover:scale-105 hover:shadow-md`}
  >
    <Icon size={20} />
    <span>เข้าสู่ระบบด้วย {provider}</span>
  </button>
);

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<"signin" | "signup">("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {currentView === "signin" ? "เข้าสู่ระบบ" : "สร้างบัญชีใหม่"}
        </h2>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, formData)} className="space-y-4">
          {currentView === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>

          {/* Confirm Password */}
          {currentView === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            {currentView === "signin" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}
          </button>
        </form>

        {/* Social Login */}
        <div className="space-y-3">
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
          <SocialButton
            icon={Twitter}
            provider="Twitter"
            bgColor="bg-sky-500"
            hoverColor="bg-sky-600"
          />
        </div>

        {/* Switch view */}
        <div className="text-center text-sm text-gray-600">
          {currentView === "signin" ? (
            <p>
              ยังไม่มีบัญชี?{" "}
              <button
                type="button"
                onClick={() => setCurrentView("signup")}
                className="text-orange-600 font-medium hover:underline"
              >
                สมัครสมาชิก
              </button>
            </p>
          ) : (
            <p>
              มีบัญชีอยู่แล้ว?{" "}
              <button
                type="button"
                onClick={() => setCurrentView("signin")}
                className="text-orange-600 font-medium hover:underline"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
