// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions, Account, Profile, User } from "next-auth";
//import { CustomSupabaseAdapter } from "@/lib/customSupabaseAdapter";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
//import TikTokProvider from "@/lib/tiktok-provider";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export const authOptions: NextAuthOptions = {
  /*
  adapter: CustomSupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SECRET_KEY!,
  }),
  */

  providers: [
    // Email Provider
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    // Twitter/X Provider
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),

    // TikTok Provider
    /*TikTokProvider({
      clientId: process.env.TIKTOK_CLIENT_ID!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
    }),
    */
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        if (!user.email) {
          console.error("No email provided");
          return false;
        }

        // ตรวจสอบว่า email นี้เคยใช้กับ provider อื่นหรือไม่
        const { data: existingProviders } = await supabase.rpc('check_email_providers', { 
          email_to_check: user.email 
        });

        if (existingProviders && existingProviders.length > 0) {
          // หา provider ที่ใช้ล่าสุด
          const latestProvider = existingProviders[0];
          
          // ถ้าไม่ใช่ provider เดียวกันกับที่กำลังจะ login
          if (account?.provider !== latestProvider.provider) {
            // เก็บข้อมูลใน session เพื่อแสดงข้อความแจ้งเตือน
            return `/auth/existing-account?email=${encodeURIComponent(user.email)}&provider=${latestProvider.provider}`;
          }
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        // เมื่อมีการ sign in ครั้งแรก
        token.id = user.id;
        token.role = user.role || "user";
        token.membership_type = user.membership_type || "free";
        token.avatar_url = user.image;
        token.isNewUser = isNewUser || false;
        
        if (account) {
          token.provider = account.provider;
          
          // สร้างหรืออัพเดตข้อมูลใน users table
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!existingUser) {
            // สร้าง user ใหม่
            await supabase.from('users').insert({
              id: user.id,
              username: user.name?.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 5),
              role: 'user',
              membership_type: 'free',
              avatar_url: user.image,
              points: 0,
              is_active: true,
              last_login_at: new Date().toISOString(),
            });
            
            // สร้าง user settings
            await supabase.from('user_settings').insert({
              user_id: user.id,
            });
            
            token.isNewUser = true;
          } else {
            // อัพเดต last_login_at
            await supabase
              .from('users')
              .update({ 
                last_login_at: new Date().toISOString(),
                avatar_url: user.image // อัพเดต avatar ถ้ามีการเปลี่ยนแปลง
              })
              .eq('id', user.id);
              
            token.role = existingUser.role;
            token.membership_type = existingUser.membership_type;
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "shop" | "admin";
        session.user.membership_type = token.membership_type as "free" | "pro1" | "pro2" | "pro3" | "special";
        session.user.provider = token.provider as string;
        session.user.isNewUser = token.isNewUser as boolean;
        
        // ดึงข้อมูลล่าสุดจาก database
        const { data: userData } = await supabase
          .from('users')
          .select('username, role, membership_type, avatar_url, points')
          .eq('id', token.id)
          .single();

        if (userData) {
          session.user.username = userData.username;
          session.user.role = userData.role;
          session.user.membership_type = userData.membership_type;
          session.user.avatar_url = userData.avatar_url;
        }
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // หากมีการส่งผู้ใช้ไปยังหน้าแจ้งเตือน existing account
      if (url.startsWith('/auth/existing-account')) {
        return url;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/auth/welcome", // หน้าต้อนรับผู้ใช้ใหม่
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log การ sign in
      console.log(`User ${user.email} signed in with ${account?.provider}`);
      
      if (isNewUser) {
        // ส่ง welcome email หรือทำอะไรพิเศษสำหรับผู้ใช้ใหม่
        console.log(`New user registered: ${user.email}`);
      }
    },
    
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email}`);
    },
  },

  debug: process.env.NODE_ENV === "development",

  secret: process.env.NEXTAUTH_SECRET,
};