// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials"; // นำเข้า CredentialsProvider
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ตรวจสอบให้แน่ใจว่าได้ตั้งค่าตัวแปรสภาพแวดล้อมเหล่านี้ใน .env.local และบน Vercel
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
// NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// NEXTAUTH_SECRET

// สร้าง Supabase client สำหรับใช้ภายใน Callbacks ต่างๆ
// <<--- สำคัญ: ใช้ SUPABASE_SERVICE_ROLE_KEY เพราะ client นี้จะรันบน Server-side API Route
// และต้องการสิทธิ์ในการเขียน/อ่านจากตาราง profiles
const supabaseForCallbacks = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- ส่วนที่เพิ่มสำหรับ Debugging (ไม่จำเป็นต้องมีใน Production) ---
console.log("--- DEBUG: Environment Variables ---");
console.log("process.env.NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET");
console.log("process.env.SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
console.log("process.env.NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET");
console.log("------------------------------------");

// ดึงค่า URL และ Key โดยตรงจาก process.env สำหรับ SupabaseAdapter
const SUPABASE_ADAPTER_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ADAPTER_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ตรวจสอบให้แน่ใจว่าตัวแปรมีค่า ก่อนที่จะส่งให้ Adapter
if (!SUPABASE_ADAPTER_URL || !SUPABASE_ADAPTER_SECRET_KEY) {
  console.error("⛔️ Critical Error: Supabase URL or SERVICE_ROLE_KEY is missing for NextAuth Adapter!");
  throw new Error("Supabase URL and SERVICE_ROLE_KEY must be set in environment variables for NextAuth SupabaseAdapter.");
}

// กำหนด AuthOptions
export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // Credentials Provider สำหรับ Email/Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
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
            // โยน error ออกไปเพื่อให้ NextAuth.js จัดการ
            throw new Error(error.message);
          }

          if (data.user) {
            console.log("Supabase signInWithPassword successful. User (from CredentialsProvider):", data.user);
            
            // **สำคัญ:** แก้ไขปัญหา Type Error โดยการระบุค่าเริ่มต้นของ role และ membership_type
            // เนื่องจาก authorize function ต้องคืนค่า User ตาม Type ที่กำหนดใน next-auth.d.ts
            // ค่าจริงจะถูกดึงจาก profiles table ใน session callback อีกที
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email,
              image: data.user.user_metadata?.avatar_url || null,
              role: "user", // ค่าเริ่มต้นสำหรับ TypeScript type
              membership_type: "free", // ค่าเริ่มต้นสำหรับ TypeScript type
              username: null, // ค่าเริ่มต้น
              avatar_url: null, // ค่าเริ่มต้น
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

  // Supabase Adapter สำหรับเชื่อม NextAuth.js กับฐานข้อมูล Supabase
  adapter: SupabaseAdapter({
    url: SUPABASE_ADAPTER_URL!,
    secret: SUPABASE_ADAPTER_SECRET_KEY!,
  }),

  // Secret Key สำหรับการเข้ารหัส JWT
  secret: process.env.NEXTAUTH_SECRET,

  // Callbacks: ส่วนสำคัญในการจัดการข้อมูล Session และ Token
  callbacks: {
    // Callback เมื่อมีการพยายาม Sign In
    async signIn({ user, account, profile, email }) {
      console.log("\n--- signIn Callback ---");
      console.log("User object from Adapter/Provider (signIn):", user);
      console.log("Account (current provider trying to sign in):", account);
      // profile จะมีเฉพาะสำหรับ OAuth providers (Google, GitHub)
      console.log("Profile (from provider):", profile);
      console.log("Email attempting to sign in with:", email);

      // Logic ตรวจสอบการเชื่อมโยง Provider เพื่อป้องกันการใช้ Email ซ้ำกับ Provider อื่น
      if (user && account && user.id) {
        try {
          const { data: identities, error: identitiesError } = await supabaseForCallbacks
            .from('identities')
            .select('provider')
            .eq('user_id', user.id);

          if (identitiesError) {
            console.error("Error fetching user identities:", identitiesError);
            throw new Error("DatabaseError: Could not verify user identities.");
          }

          const linkedProviders = identities.map(identity => identity.provider);
          console.log("Linked Providers for this user ID:", linkedProviders);

          const isCurrentProviderAlreadyLinked = linkedProviders.includes(account.provider);

          if (!isCurrentProviderAlreadyLinked && linkedProviders.length > 0) {
            const suggestedProvider = linkedProviders[0];
            console.log(`User ${email} tried to sign in with ${account.provider} but has existing linked providers. Suggesting: ${suggestedProvider}`);
            // โยน error ที่มีข้อความเฉพาะ เพื่อให้สามารถจับและ redirect ไปยังหน้า error ได้
            throw new Error(`AuthMethodMismatch:${suggestedProvider}`);
          }
          console.log("Allowing sign-in: Current provider is linked or no existing providers for this user.");
          return true; // อนุญาตให้ Sign In

        } catch (e: any) {
          if (e.message.startsWith("AuthMethodMismatch:")) {
            console.warn("Auth method mismatch detected, redirecting to custom error page.");
            return `/auth/error?error=${encodeURIComponent(e.message)}`; // Redirect ไปหน้า error ที่กำหนด
          }
          console.error("Unexpected error in signIn callback:", e);
          return false; // ไม่อนุญาตให้ Sign In
        }
      }

      console.log("No specific conflict detected, allowing default sign-in behavior.");
      return true;
    },

    // Callback สำหรับจัดการ JWT (JSON Web Token)
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("\n--- JWT Callback ---");
      console.log("Current Token:", token);
      console.log("User (from Adapter/Provider):", user);
      console.log("Account:", account);
      console.log("Profile:", profile);
      console.log("Is New User?:", isNewUser);

      // เพิ่มข้อมูล user พื้นฐานเข้าสู่ token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || profile?.name;
        token.picture = user.image || profile?.image;
        token.provider = account?.provider; // เพิ่ม provider เข้า token
        token.isNewUser = isNewUser; // เพิ่มสถานะผู้ใช้ใหม่เข้า token
      }

      // สำหรับผู้ใช้ใหม่ หรือผู้ใช้ที่เพิ่งเชื่อมต่อ Social Login ใหม่
      // ตรวจสอบและสร้าง/อัปเดตข้อมูลในตาราง `profiles`
      if (isNewUser && user) {
        console.log("New user detected or new social identity linked. Checking/creating/updating profile...");
        try {
          // ตรวจสอบว่ามี profile อยู่แล้วหรือไม่
          const { data: existingProfile, error: fetchError } = await supabaseForCallbacks
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 คือ 'no rows found'
            console.error("Error checking existing profile:", fetchError);
          }

          if (!existingProfile) {
            console.log("No existing profile found for user ID, creating new profile...");
            // **กำหนดค่าเริ่มต้นสำหรับผู้ใช้ใหม่: role เป็น "user" และ membership_type เป็น "free"**
            const { data, error } = await supabaseForCallbacks
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  name: user.name || profile?.name || 'New User',
                  avatar_url: user.image || profile?.image,
                  role: "user", // <<--- กำหนด role เริ่มต้น
                  membership_type: "free", // <<--- กำหนด membership_type เริ่มต้น
                  created_at: new Date().toISOString(),
                },
              ]);

            if (error) {
              console.error("Error creating user profile in public.profiles:", error);
            } else {
              console.log("User profile created successfully in public.profiles:", data);
            }
          } else {
            console.log("Profile already exists for this user ID, updating existing profile.");
            // อัปเดตข้อมูล profile ที่อาจเปลี่ยนแปลง (เช่น ชื่อ, รูปโปรไฟล์)
            const { error: updateError } = await supabaseForCallbacks
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

    // Callback สำหรับสร้าง Session Object
    async session({ session, token, user }) {
      console.log("\n--- Session Callback ---");
      console.log("Current Session:", session);
      console.log("Token (from JWT callback):", token);
      console.log("User (from Adapter/DB):", user); // user object จาก adapter

      // เพิ่มข้อมูลจาก token เข้าสู่ session.user
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
      if (token?.provider) {
        session.user.provider = token.provider as string;
      }
      if (token?.isNewUser) {
        session.user.isNewUser = token.isNewUser as boolean;
      }

      // ดึงข้อมูลเพิ่มเติมจากตาราง `profiles` (เช่น role, membership_type)
      if (session.user.id) {
        try {
          const { data: profile, error } = await supabaseForCallbacks
            .from('profiles')
            .select('username, role, membership_type, avatar_url') // เลือกฟิลด์ที่ต้องการ
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 คือ 'no rows found'
            console.error("Error fetching user profile for session:", error);
          } else if (profile) {
            // เพิ่มข้อมูลจาก profile เข้าสู่ session.user
            session.user.username = profile.username || null;
            session.user.role = profile.role || "user"; // กำหนดค่าเริ่มต้นเป็น "user" ถ้าไม่มี
            session.user.membership_type = profile.membership_type || "free"; // กำหนดค่าเริ่มต้นเป็น "free" ถ้าไม่มี
            session.user.avatar_url = profile.avatar_url || null;
          } else {
            // หากไม่พบ profile ใน DB แต่มีการสร้าง session (อาจจะเพิ่งสมัคร)
            // ให้ใช้ค่าเริ่มต้นตามที่ตั้งไว้ใน JWT callback
            session.user.role = "user";
            session.user.membership_type = "free";
            session.user.username = null;
            session.user.avatar_url = null;
          }
        } catch (e) {
          console.error("Exception in Session callback during profile fetch:", e);
          // หากเกิดข้อผิดพลาด ให้กำหนดค่าเริ่มต้นเพื่อป้องกัน Type Error
          session.user.role = "user";
          session.user.membership_type = "free";
        }
      } else {
        // กรณีที่ session.user.id ไม่มี (ไม่ควรเกิดขึ้นหาก login สำเร็จ)
        session.user.role = "user";
        session.user.membership_type = "free";
      }

      console.log("Final Session:", session);
      console.log("--- End Session Callback ---\n");
      return session;
    },
  },

  // ตั้งค่า Debug mode สำหรับ Development
  debug: process.env.NODE_ENV === "development",

  // กำหนดหน้าสำหรับ Error ต่างๆ
  pages: {
    error: '/auth/error', // หน้านี้จะถูกเรียกเมื่อเกิด error ใน NextAuth.js
  },
};

export default NextAuth(authOptions);