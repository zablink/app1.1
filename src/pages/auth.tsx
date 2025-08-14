// pages/auth.tsx

import React from "react";
import { Chrome, Facebook, Twitter } from "lucide-react";

// 🔹 TikTok Icon Component
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

type Provider = "Google" | "Facebook" | "Twitter" | "TikTok";
type SocialButtonProps = {
  icon: React.FC<{ size?: number }>;
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
    onClick={() => console.log(`Login with ${provider}`)}
    className={`w-full flex items-center justify-center gap-3 px-4 py-3 ${bgColor} ${textColor} rounded-lg font-medium transition-all duration-200 hover:${hoverColor} hover:scale-105 hover:shadow-md`}
  >
    <Icon size={20} />
    <span>เข้าสู่ระบบด้วย {provider}</span>
  </button>
);

// ใช้ในหน้า Auth
export default function AuthSocial() {
  return (
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
      <SocialButton
        icon={TikTokIcon}
        provider="TikTok"
        bgColor="bg-black"
        hoverColor="bg-gray-800"
      />
    </div>
  );
}
