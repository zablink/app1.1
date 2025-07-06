import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";

/// Social Login Providers
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import LineProvider from "next-auth/providers/line";
import TikTokProvider from "@/lib/tiktok-provider"; // ✅ เปลี่ยนจาก next-auth/providers/oauth


import { CustomSupabaseAdapter } from '@/lib/customSupabaseAdapter';
import type { AdapterUser } from 'next-auth/adapters';

const allowedRoles = ["user", "store", "admin"] as const;
const allowedMembershipTypes = ["free", "pro1", "pro2", "pro3", "special"] as const;

type Role = (typeof allowedRoles)[number];
type MembershipType = (typeof allowedMembershipTypes)[number];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (!supabaseUrl) console.log('❌ Missing SUPABASE_URL');
  if (!supabaseKey) console.log('❌ Missing SUPABASE_KEY');
  throw new Error("❌ Missing Supabase credentials");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
    TikTokProvider({
      id: "tiktok",
      name: "TikTok",
      type: "oauth",
      clientId: process.env.TIKTOK_CLIENT_ID!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
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
          role: "user", // ✅ default
          membershipType: "free", // ✅ default
        };
      },
    }),
  ],
  adapter: CustomSupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseKey,
  }),
  session: {
    strategy: "jwt", // ✅ หรือใช้ "database" ถ้าต้องการให้ session เก็บใน DB
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("✅ [signIn callback]", { user, account, profile });
      return true;
    },
    async jwt({ token, user, account }) {
      console.log("🟨 [jwt callback - before]", { token, user, account });
      if (user) {
        token.id = user.id;
        token.role = (user as AdapterUser & { role?: string }).role;
        token.membershipType = (user as AdapterUser & { membershipType?: string }).membershipType;
      }
      if (account) {
        token.provider = account.provider;
        token.isNewUser = true;
      }
      console.log("✅ [jwt callback - after]", token);
      return token;
    },
    async session({ session, token }) {
      console.log("🟨 [session callback - before]", { session, token });
      if (session.user) {
        session.user.id = token.id as string;
        if (allowedRoles.includes(token.role as Role)) {
          session.user.role = token.role as Role;
        }
        if (allowedMembershipTypes.includes(token.membershipType as MembershipType)) {
          session.user.membershipType = token.membershipType as MembershipType;
        }
        session.user.isNewUser = token.isNewUser as boolean;
        session.user.provider = token.provider as string;
      }
      console.log("✅ [session callback - after]", session);
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ ใช้ trustHost และ type-cast ด้วย as any
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    ...authOptions,
    trustHost: true as any,
  } as any);
}
