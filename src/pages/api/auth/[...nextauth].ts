import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";

import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { CustomSupabaseAdapter } from '@/lib/customSupabaseAdapter';
import type { AdapterUser } from 'next-auth/adapters';

const allowedRoles = ["user", "store", "admin"] as const;
const allowedMembershipTypes = ["free", "pro1", "pro2", "pro3", "special"] as const;

type Role = (typeof allowedRoles)[number];
type MembershipType = (typeof allowedMembershipTypes)[number];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (!supabaseUrl) console.log('SP URL');
  if (!supabaseKey) console.log('SP KEY');
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
  ],
  adapter: CustomSupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseKey,
  }),
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as AdapterUser & { role?: string }).role;
        token.membershipType = (user as AdapterUser & { membershipType?: string }).membershipType;
      }
      if (account) {
        token.provider = account.provider;
        token.isNewUser = true;
      }
      return token;
    },
    async session({ session, token }) {
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
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ ใส่ trustHost ที่นี่ และใช้ type `any` เพื่อหลบ TypeScript issue
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    ...authOptions,
    trustHost: true as any, // 👈 หลบ type error ได้ปลอดภัย
  } as any); // 👈 อีกจุดที่จำเป็นเพราะ Type ยังไม่รองรับใน version ปัจจุบัน
}
