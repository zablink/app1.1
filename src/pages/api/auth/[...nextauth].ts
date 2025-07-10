// /pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";
import { createClient } from '@supabase/supabase-js';

// Social Login Providers
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import LineProvider from "next-auth/providers/line";
import TikTokProvider from "@/lib/tiktok-provider";

import { CustomSupabaseAdapter } from '@/lib/customSupabaseAdapter';
import type { AdapterUser } from 'next-auth/adapters';

// --- Type Definitions ---
const allowedRoles = ["user", "store", "admin"] as const;
const allowedMembershipTypes = ["free", "pro1", "pro2", "pro3", "special"] as const;
type Role = (typeof allowedRoles)[number];
type MembershipType = (typeof allowedMembershipTypes)[number];

// --- Supabase Credentials ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (!supabaseUrl) console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  throw new Error("❌ Missing Supabase credentials");
}

// --- Initialize Supabase Client for Server-Side Operations ---
const supabase = createClient(supabaseUrl, supabaseKey);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      // เพิ่ม allowDangerousEmailAccountLinking: true เพื่อให้เราจัดการเองใน callback
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    TikTokProvider({
      clientId: process.env.TIKTOK_CLIENT_ID!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: CustomSupabaseAdapter({
    url: supabaseUrl,
    secret: supabaseKey,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // ✅ This is the key part of the solution
    async signIn({ user, account, profile }) {
      console.log("✅ [signIn callback triggered]", { user, account });

      // For credential-based login, we don't need to check for account linking
      if (account?.provider === 'credentials') {
        return true;
      }

      // For OAuth providers
      if (account && user.email) {
        // Search for a user with the same email in the 'users' table
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 = 'single row not found'
          console.error("Error fetching user:", userError);
          return false; // Block sign in on db error
        }

        // If a user with this email already exists
        if (existingUser) {
          console.log(`User with email ${user.email} already exists. ID: ${existingUser.id}`);
          
          // Check if an account link for this provider already exists for this user
          const { data: linkedAccount, error: accountError } = await supabase
            .from('accounts')
            .select('provider')
            .eq('userId', existingUser.id)
            .eq('provider', account.provider)
            .single();

          if (accountError && accountError.code !== 'PGRST116') {
             console.error("Error fetching linked account:", accountError);
             return false;
          }
          
          // If the account is already linked to this provider, allow sign-in
          if (linkedAccount) {
            console.log(`Account already linked for provider: ${account.provider}. Allowing sign-in.`);
            return true;
          } else {
            // If the account is NOT linked, it means the user signed up with another method.
            // We must block this login attempt and guide the user.
            const { data: existingProviders } = await supabase
              .from('accounts')
              .select('provider')
              .eq('userId', existingUser.id);
            
            const providerName = existingProviders?.[0]?.provider || 'another method';
            console.warn(`Sign-in blocked. Email exists but is not linked to ${account.provider}. It's linked to:`, existingProviders);
            
            // Redirect user back to login page with a specific error message
            // The provider name is passed to show a more helpful message on the frontend.
            throw new Error(`To continue, sign in with ${providerName}.`);
          }
        }
      }
      
      // If it's a new user (no existing user with that email), allow the sign-in.
      // The adapter will create the new user and account link.
      console.log("New user or no conflict. Allowing sign-in.");
      return true;
    },
    
    async jwt({ token, user, account }) {
      // This part remains mostly the same, it populates the JWT
      if (user) {
        token.id = user.id;
        token.role = (user as AdapterUser & { role?: string }).role;
        token.membershipType = (user as AdapterUser & { membershipType?: string }).membershipType;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    
    async session({ session, token }) {
      // This part remains mostly the same, it populates the session from the JWT
      if (session.user) {
        session.user.id = token.id as string;
        if (allowedRoles.includes(token.role as Role)) {
          session.user.role = token.role as Role;
        }
        if (allowedMembershipTypes.includes(token.membershipType as MembershipType)) {
          session.user.membershipType = token.membershipType as MembershipType;
        }
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    // We can use the default error page and pass our custom message
    error: '/login', 
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Pass the error message from the thrown error to the query parameters
  return NextAuth(req, res, authOptions);
}
