// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions, CallbacksOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
// import { SupabaseAdapter } from "@next-auth/supabase-adapter"; // <-- REMOVED
// import { createClient as createSupabaseClient } from "@supabase/supabase-js"; // <-- REMOVED

// ตรวจสอบให้แน่ใจว่าได้ตั้งค่าตัวแปรสภาพแวดล้อมเหล่านี้ใน .env.local และบน Vercel
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
// GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
// NEXTAUTH_SECRET

// --- REMOVED Supabase client for Adapter ---
// const supabase = createSupabaseClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// );

// --- REMOVED Supabase client for Callbacks (not needed without DB) ---
// const supabaseForCallbacks = createSupabaseClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!, // หรือ process.env.SUPABASE_URL!
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// --- Temporary Mock for Linked Providers (for testing AuthMethodMismatch without DB) ---
// In a real application, this data would come from your database
const MOCK_LINKED_PROVIDERS: { [email: string]: string[] } = {};

// Helper function to simulate adding a linked provider
function mockAddLinkedProvider(email: string, provider: string) {
  if (!MOCK_LINKED_PROVIDERS[email]) {
    MOCK_LINKED_PROVIDERS[email] = [];
  }
  if (!MOCK_LINKED_PROVIDERS[email].includes(provider)) {
    MOCK_LINKED_PROVIDERS[email].push(provider);
  }
  console.log("MOCK: Linked Providers after add:", MOCK_LINKED_PROVIDERS);
}

const authOptions: NextAuthOptions = {
  // adapter: SupabaseAdapter({ // <-- REMOVED SupabaseAdapter
  //   url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!, // ใช้ GITHUB_ID ตามชื่อที่คุณตั้งใน .env
      clientSecret: process.env.GITHUB_SECRET!, // ใช้ GITHUB_SECRET ตามชื่อที่คุณตั้งใน .env
    }),
    // เพิ่ม Facebook, TikTok ได้ที่นี่ แต่ต้องหา Provider หรือสร้าง Custom Provider
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!
    // }),
    // สำหรับ TikTok อาจจะต้องใช้ Custom Provider เนื่องจาก NextAuth ไม่มี Built-in Provider
  ],

  session: {
    strategy: "jwt", // Always use "jwt" strategy with SupabaseAdapter (or when no adapter)
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  pages: {
    signIn: "/login",
    // error: '/auth/error', // Optionally define a custom error page
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("\n--- signIn Callback ---");
      console.log("User object from Provider:", user); // user object contains id, name, email, image
      console.log("Account (current provider trying to sign in):", account); // account object contains provider, type, providerAccountId, access_token, etc.
      console.log("Profile (from provider):", profile); // raw profile data from the OAuth provider

      if (!user || !account || !user.email) {
        console.warn("Missing user, account, or user.email in signIn callback.");
        return false;
      }

      try {
        const userEmail = user.email;
        const currentProvider = account.provider;

        // --- MOCK: Simulate fetching linked providers from DB ---
        const linkedProviders = MOCK_LINKED_PROVIDERS[userEmail] || [];
        console.log("MOCK: Linked Providers for this email:", linkedProviders);

        const isCurrentProviderAlreadyLinked = linkedProviders.includes(currentProvider);

        // Logic for "AuthMethodMismatch" (บังคับใช้ Provider เดิม)
        // ถ้าผู้ใช้เคยล็อกอินด้วยอีเมลนี้มาแล้ว และ Provider ที่ใช้ล็อกอินปัจจุบันไม่ตรงกับที่เคยใช้
        if (linkedProviders.length > 0 && !isCurrentProviderAlreadyLinked) {
          const suggestedProvider = linkedProviders[0]; // แนะนำ provider แรกที่เจอ
          console.log(`MOCK: User ${userEmail} tried to sign in with ${currentProvider} but has existing linked providers. Suggesting: ${suggestedProvider}`);
          throw new Error(`AuthMethodMismatch:${suggestedProvider}`);
        }

        // ถ้ามาถึงตรงนี้ แสดงว่า:
        // 1. ผู้ใช้ไม่เคยล็อกอินด้วยอีเมลนี้มาก่อน (linkedProviders.length === 0)
        // 2. ผู้ใช้เคยล็อกอินด้วยอีเมลนี้มาแล้ว และ Provider ที่ใช้ล็อกอินตรงกับที่เคยใช้
        // ในทั้งสองกรณี อนุญาตให้เข้าสู่ระบบ
        
        // --- MOCK: Add current provider to linked providers for this email ---
        mockAddLinkedProvider(userEmail, currentProvider);

        console.log("Allowing sign-in: Current provider is linked or no existing providers for this user.");
        return true;

      } catch (e: any) {
        if (e.message.startsWith("AuthMethodMismatch:")) {
          console.warn("Auth method mismatch detected, redirecting to custom error page.");
          throw e; // โยน error นี้เพื่อให้ NextAuth จัดการ redirect
        }
        console.error("Unexpected error in signIn callback:", e);
        return false; // ปฏิเสธการเข้าสู่ระบบสำหรับ error อื่นๆ
      }
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("\n--- JWT Callback ---");
      console.log("Initial Token:", token);
      console.log("User (from Adapter/Provider):", user); // 'user' is only available on first sign in or subsequent sign ins if adapter is used
      console.log("Account:", account); // Account details from the provider
      console.log("Profile:", profile); // Raw profile data from the provider
      console.log("Is New User?", isNewUser);

      // Add user ID (from `user` object) to token. This `user.id` will be the one NextAuth generates
      // or the one provided by the Adapter (if used).
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // You can add more user data to the token here if needed (e.g., role)
        // For example, if you fetch a 'role' from a DB in signIn, you can add it to user object
        // and then map it to the token here.
      }

      console.log("Final Token (from JWT callback):", token);
      console.log("--- End JWT Callback ---\n");
      return token;
    },

    async session({ session, token }) {
      console.log("\n--- Session Callback ---");
      console.log("Session (initial):", session);
      console.log("Token (from JWT callback):", token);

      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.email) {
        session.user.email = token.email as string;
      }
      if (token?.name) {
        session.user.name = token.name as string;
      }
      if (token?.picture) {
        session.user.image = token.picture as string;
      }

      // --- REMOVED Supabase Profile Fetching ---
      // if (session.user.id) {
      //   try {
      //     const { data: profile, error } = await supabaseForCallbacks
      //       .from('profiles')
      //       .select('*')
      //       .eq('id', session.user.id)
      //       .single();

      //     if (error && error.code !== 'PGRST116') {
      //       console.error("Error fetching user profile for session:", error);
      //     } else if (profile) {
      //       session.user.username = profile.username || null;
      //       session.user.role = profile.role || "user";
      //       session.user.membership_type = profile.membership_type || "free";
      //       session.user.avatar_url = profile.avatar_url || null;
      //     }
      //   } catch (e) {
      //     console.error("Exception in Session callback during profile fetch:", e);
      //   }
      // } 
      console.log("Final Session:", session);
      console.log("--- End Session Callback ---\n");
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);