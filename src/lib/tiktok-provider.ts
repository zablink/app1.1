// src/lib/tiktok-provider.ts
import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

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

export default function TikTokProvider<P extends TikTokProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
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
    profile(profile) {
      return {
        id: profile.data.user.open_id,
        name: profile.data.user.display_name,
        email: profile.data.user.email ?? `${profile.data.user.open_id}@tiktok.com`,
        image: profile.data.user.avatar_url,
      };
    },
    ...options,
  };
}
