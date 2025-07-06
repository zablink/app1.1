// src/lib/tiktok-provider.ts
import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import type { User } from "next-auth";

export interface TikTokProfile {
  data: {
    user: {
      open_id: string;
      display_name: string;
      avatar_url: string;
      email?: string;
    };
  };
}

export default function TikTokProvider(
  options: OAuthUserConfig<TikTokProfile>
): OAuthConfig<TikTokProfile> {
  return {
    id: "tiktok",
    name: "TikTok",
    type: "oauth",
    version: "2.0",
    authorization: {
      url: "https://www.tiktok.com/v2/auth/authorize/",
      params: {
        scope: "user.info.basic",
        response_type: "code",
      },
    },
    token: "https://open.tiktokapis.com/v2/oauth/token/",
    userinfo: "https://open.tiktokapis.com/v2/user/info/",
    // **กำหนด profile function ให้รับสอง parameter (profile, tokens)**
    profile(profile: TikTokProfile, tokens) : User {
      return {
        id: profile.data.user.open_id,
        name: profile.data.user.display_name,
        email: profile.data.user.email ?? `${profile.data.user.open_id}@tiktok.com`,
        image: profile.data.user.avatar_url,
        role: "user",
        membershipType: "free",
      } as User;
    },
    ...options,
  };
}
