// pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github"; // ถ้าใช้ GitHub ด้วย
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";

// ตรวจสอบให้แน่ใจว่าได้ตั้งค่าตัวแปรสภาพแวดล้อมเหล่านี้ใน .env.local
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
// SUPABASE_URL, SUPABASE_SECRET_KEY (ต้องเป็น SERVICE_ROLE_KEY)
// NEXTAUTH_SECRET

// สร้าง Supabase client สำหรับ Adapter
// **สำคัญ**: ใช้ SUPABASE_SECRET_KEY (service_role key) เพื่อให้ NextAuth Adapter มีสิทธิ์ในการจัดการ Auth ได้
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // ถ้าใช้ GitHub
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SECRET_KEY!, // ย้ำอีกครั้งว่าต้องเป็น service_role key
  }),

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // callback นี้จะถูกเรียกก่อนที่ NextAuth จะทำการสร้าง Session หรือ JWT
    // เหมาะสำหรับตรวจสอบเงื่อนไขการล็อกอิน
    async signIn({ user, account, profile, email }) {
      console.log("\n--- signIn Callback ---");
      console.log("User object from Adapter (if email exists):", user);
      console.log("Account (current provider trying to sign in):", account);
      console.log("Profile (from provider):", profile);
      console.log("Email attempting to sign in with:", email);

      // หาก user object ถูกส่งกลับมาโดย Adapter แสดงว่ามีบัญชีผู้ใช้ที่มีอีเมลนี้อยู่แล้วใน Supabase
      if (user && account && user.id) {
        try {
          // ดึงข้อมูล identities ทั้งหมดที่เชื่อมโยงกับ user ID นี้
          // เราใช้ service_role key ใน supabase client จึงสามารถเข้าถึง auth.identities ได้โดยตรง
          const { data: identities, error: identitiesError } = await supabase
            .from('identities') // เข้าถึงตาราง auth.identities โดยตรง
            .select('provider')
            .eq('user_id', user.id);

          if (identitiesError) {
            console.error("Error fetching user identities:", identitiesError);
            // ถ้าดึงข้อมูล identities ไม่ได้ ให้ถือว่ามีปัญหาภายในและไม่อนุญาตให้ล็อกอิน
            throw new Error("DatabaseError: Could not verify user identities.");
          }

          const linkedProviders = identities.map(identity => identity.provider);
          console.log("Linked Providers for this user ID:", linkedProviders);

          // ตรวจสอบว่า Provider ที่ผู้ใช้กำลังพยายามล็อกอิน (account.provider)
          // อยู่ในรายการ Provider ที่เชื่อมโยงอยู่แล้วหรือไม่
          const isCurrentProviderAlreadyLinked = linkedProviders.includes(account.provider);

          // เงื่อนไข:
          // 1. Provider ที่กำลังพยายามล็อกอินยังไม่ได้เชื่อมโยงกับบัญชีนี้
          // 2. บัญชีนี้มี Provider อื่นๆ ที่เชื่อมโยงอยู่แล้ว (ไม่ได้เป็นบัญชีใหม่ที่ไม่มี Provider เลย)
          if (!isCurrentProviderAlreadyLinked && linkedProviders.length > 0) {
            // พบว่าอีเมลนี้เคยล็อกอินด้วยวิธีอื่นแล้ว และกำลังพยายามใช้วิธีใหม่ที่ยังไม่ได้เชื่อมโยง
            // เราจะป้องกันการล็อกอินและแจ้งเตือนผู้ใช้
            const suggestedProvider = linkedProviders[0]; // เลือก Provider แรกที่พบเพื่อแนะนำ
            console.log(`User ${email} tried to sign in with ${account.provider} but has existing linked providers. Suggesting: ${suggestedProvider}`);

            // โยน Error ที่กำหนดเอง เพื่อให้ NextAuth Redirect ไปยังหน้า Error
            // และเราจะ parse ข้อความนี้ในหน้า Error.tsx
            throw new Error(`AuthMethodMismatch:${suggestedProvider}`);
          }
          // หาก Provider ปัจจุบันเชื่อมโยงอยู่แล้ว หรือเป็นบัญชีใหม่ที่ยังไม่มี Provider อื่นๆ
          // ให้ NextAuth ดำเนินการต่อตามปกติ (SupabaseAdapter จะจัดการการสร้าง/เชื่อมโยง)
          console.log("Allowing sign-in: Current provider is linked or no existing providers for this user.");
          return true;

        } catch (e: any) {
          // หากเป็น Error ที่เรากำหนดเอง (AuthMethodMismatch) ให้โยนต่อไป
          if (e.message.startsWith("AuthMethodMismatch:")) {
            console.warn("Auth method mismatch detected, redirecting to custom error page.");
            throw e; // Re-throw the custom error
          }
          // สำหรับ Error อื่นๆ ที่ไม่คาดคิด ให้บันทึกและป้องกันการล็อกอิน
          console.error("Unexpected error in signIn callback:", e);
          return false;
        }
      }

      // หาก user เป็น null (อีเมลใหม่ทั้งหมด) หรือเป็นกรณีอื่นๆ ที่ไม่มีความขัดแย้ง
      // ให้ NextAuth ดำเนินการต่อตามปกติ
      console.log("No specific conflict detected, allowing default sign-in behavior.");
      return true;
    },

    // callback นี้จะถูกเรียกเมื่อมีการสร้างหรืออัปเดต JWT (JSON Web Token)
    // คุณสามารถเพิ่มข้อมูลผู้ใช้เพิ่มเติมลงใน token ได้ที่นี่
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("\n--- JWT Callback ---");
      console.log("Current Token:", token);
      console.log("User (from Adapter/Provider):", user);
      console.log("Account:", account);
      console.log("Profile:", profile);
      console.log("Is New User?:", isNewUser);

      if (user) {
        token.id = user.id; // เพิ่ม user id จาก Supabase เข้าไปใน token
        token.email = user.email;
        token.name = user.name || profile?.name;
        token.picture = user.image || profile?.image; // รูปโปรไฟล์
      }

      // หากเป็นผู้ใช้ใหม่ (หรือเพิ่งเชื่อมโยง Social Account ใหม่) และคุณต้องการสร้าง/อัปเดตโปรไฟล์ในตาราง public.profiles
      // คุณสามารถทำได้ที่นี่
      if (isNewUser && user) {
        console.log("New user detected or new social identity linked. Checking/creating/updating profile...");
        try {
          // ตรวจสอบว่ามีโปรไฟล์อยู่แล้วหรือไม่
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles') // ตรวจสอบให้แน่ใจว่ามีตาราง 'profiles' ใน public schema
            .select('id')
            .eq('id', user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 คือ "No rows found"
            console.error("Error checking existing profile:", fetchError);
          }

          if (!existingProfile) {
            console.log("No existing profile found for user ID, creating new profile...");
            const { data, error } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  name: user.name || profile?.name || 'New User',
                  avatar_url: user.image || profile?.image,
                  // เพิ่มฟิลด์อื่นๆ ตามต้องการ
                },
              ]);

            if (error) {
              console.error("Error creating user profile in public.profiles:", error);
            } else {
              console.log("User profile created successfully in public.profiles:", data);
            }
          } else {
            console.log("Profile already exists for this user ID, updating existing profile.");
            // หากมีโปรไฟล์อยู่แล้ว คุณอาจต้องการอัปเดตข้อมูลบางอย่าง
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                name: user.name || profile?.name,
                avatar_url: user.image || profile?.image,
              })
              .eq('id', user.id);

            if (updateError) {
              console.error("Error updating existing user profile:", updateError);
            } else {
              console.log("Existing user profile updated.");
            }
          }
        } catch (e) {
          console.error("Exception in JWT callback during profile creation/update:", e);
        }
      }
      console.log("--- End JWT Callback ---\n");
      return token;
    },

    // callback นี้จะถูกเรียกเมื่อมีการสร้าง Session
    // คุณสามารถเพิ่มข้อมูลจาก JWT หรือข้อมูลอื่นๆ เข้าไปใน Session object ได้
    async session({ session, token, user }) {
      console.log("\n--- Session Callback ---");
      console.log("Current Session:", session);
      console.log("Token (from JWT callback):", token);
      console.log("User (from Adapter/DB):", user);

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

      // ดึงข้อมูลเพิ่มเติมจากตาราง public.profiles เพื่อใส่ใน session
      if (session.user.id) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 คือ "No rows found"
            console.error("Error fetching user profile for session:", error);
          } else if (profile) {
            session.user.username = profile.username; // ตัวอย่าง: เพิ่ม username
            session.user.role = profile.role; // ตัวอย่าง: เพิ่ม role จากตาราง profiles
            // เพิ่มฟิลด์อื่นๆ จาก profile เข้าไปใน session ตามต้องการ
          }
        } catch (e) {
          console.error("Exception in Session callback during profile fetch:", e);
        }
      }
      console.log("Final Session:", session);
      console.log("--- End Session Callback ---\n");
      return session;
    },
  },

  // เปิด debug mode ในตอนพัฒนา เพื่อดู log เพิ่มเติม
  debug: process.env.NODE_ENV === "development",

  // กำหนดหน้าสำหรับ Error เพื่อให้แสดงข้อความที่ชัดเจนขึ้น
  pages: {
    error: '/auth/error', // สร้างไฟล์นี้เพื่อแสดงข้อความ error
  },
});
