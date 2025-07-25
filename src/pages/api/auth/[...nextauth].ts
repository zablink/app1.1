// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials"; // <<--- เพิ่มการนำเข้าตัวนี้
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ... (ส่วนโค้ดการตรวจสอบ Environment Variables และการสร้าง supabaseForInternalUse client ที่มีอยู่เดิม) ...

const supabaseForCallbacks = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ... (ส่วนโค้ดการตรวจสอบ Environment Variables สำหรับ Adapter ที่มีอยู่เดิม) ...

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // <<--- เพิ่ม Credentials Provider นี้เข้ามา
    CredentialsProvider({
      name: "Credentials", // ชื่อของ Provider (จะใช้เมื่อเรียก signIn("credentials", ...))
      credentials: { // กำหนดฟิลด์ข้อมูลที่ต้องการรับ
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // ฟังก์ชันนี้จะถูกเรียกเมื่อ NextAuth.js พยายาม authenticate ด้วย "credentials"
        if (!credentials?.email || !credentials?.password) {
          return null; // ไม่มีข้อมูล email/password
        }

        try {
          // ใช้ Supabase client ในการตรวจสอบ email/password
          const { data, error } = await supabaseForCallbacks.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase signInWithPassword error (in NextAuth CredentialsProvider):", error.message);
            // คุณสามารถส่งข้อความ error ที่กำหนดเองกลับไปให้ NextAuth.js ได้
            throw new Error(error.message); // NextAuth.js จะจับ error นี้และแสดงผล
          }

          if (data.user) {
            // ถ้า Supabase ยืนยันผู้ใช้ได้สำเร็จ ให้คืนค่า user object
            // NextAuth.js จะใช้ user object นี้ในการสร้าง Session
            console.log("Supabase signInWithPassword successful. User (from CredentialsProvider):", data.user);
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email, // ปรับตาม user_metadata ของคุณ
              image: data.user.user_metadata?.avatar_url || null, // ปรับตาม user_metadata ของคุณ
            };
          } else {
            console.warn("Supabase signInWithPassword returned no user data (in CredentialsProvider).");
            return null; // ไม่มี user ถูกคืนค่าจาก Supabase
          }
        } catch (e: any) {
          console.error("Authorize function caught an exception (in CredentialsProvider):", e.message);
          return null; // หรือ throw new Error("Invalid credentials");
        }
      },
    }),
  ],

  // ... (ส่วน adapter, secret ที่มีอยู่เดิม) ...

  callbacks: {
    // Callbacks ส่วนนี้ที่เหลือ ยังคงเหมือนเดิมเพราะมันถูกออกแบบมาเพื่อรับ user object
    // จาก Adapter/Provider อยู่แล้ว ไม่ว่าจะมาจาก Google, GitHub หรือ Credentials
    async signIn({ user, account, profile, email }) {
      // ... (โค้ดเดิมของคุณ) ...
      // Logic การตรวจสอบ AuthMethodMismatch จะยังคงทำงานได้ดี
      return true;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      // ... (โค้ดเดิมของคุณ) ...
      return token;
    },

    async session({ session, token, user }) {
      // ... (โค้ดเดิมของคุณ) ...
      // ส่วนนี้สำคัญมาก เพราะมันดึง role จาก profiles table มาใส่ใน session.user
      // ซึ่งทำให้ Navbar ของคุณสามารถใช้ session.user.role ได้
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",

  pages: {
    error: '/auth/error', // หน้านี้จะจับ error เช่น AuthMethodMismatch ที่มาจาก callback
    // คุณสามารถกำหนดหน้า login/signup ให้ NextAuth.js จัดการได้
    // signIn: '/login', // ถ้าต้องการให้ NextAuth.js จัดการ route /login โดยตรง
    // newUser: '/signup', // ถ้าต้องการให้ NextAuth.js จัดการ route /signup สำหรับผู้ใช้ใหม่
  },
};

export default NextAuth(authOptions);