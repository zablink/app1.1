// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth"; // Import NextAuthOptions type
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient as createSupabaseClient } from "@supabase/supabase-js"; // <--- ใช้ createClient as createSupabaseClient

// ตรวจสอบให้แน่ใจว่าได้ตั้งค่าตัวแปรสภาพแวดล้อมเหล่านี้ใน .env.local และบน Vercel
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
// SUPABASE_URL, SUPABASE_SECRET_KEY (ต้องเป็น SERVICE_ROLE_KEY)
// NEXTAUTH_SECRET

// สร้าง Supabase client สำหรับ Adapter
// **แก้ไขตรงนี้**: เรียกใช้ createSupabaseClient แทน createClient
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY! // ต้องเป็น SERVICE_ROLE_KEY
);

// กำหนด AuthOptions แยกต่างหาก
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
  ],

  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!, // ต้องเป็น service_role key
  }),

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account, profile, email }) {
      console.log("\n--- signIn Callback ---");
      console.log("User object from Adapter (if email exists):", user);
      console.log("Account (current provider trying to sign in):", account);
      console.log("Profile (from provider):", profile);
      console.log("Email attempting to sign in with:", email);

      if (user && account && user.id) {
        try {
          const { data: identities, error: identitiesError } = await supabase
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
            throw new Error(`AuthMethodMismatch:${suggestedProvider}`);
          }
          console.log("Allowing sign-in: Current provider is linked or no existing providers for this user.");
          return true;

        } catch (e: any) {
          if (e.message.startsWith("AuthMethodMismatch:")) {
            console.warn("Auth method mismatch detected, redirecting to custom error page.");
            throw e;
          }
          console.error("Unexpected error in signIn callback:", e);
          return false;
        }
      }

      console.log("No specific conflict detected, allowing default sign-in behavior.");
      return true;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("\n--- JWT Callback ---");
      console.log("Current Token:", token);
      console.log("User (from Adapter/Provider):", user);
      console.log("Account:", account);
      console.log("Profile:", profile);
      console.log("Is New User?:", isNewUser);

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || profile?.name;
        token.picture = user.image || profile?.image;
      }

      if (isNewUser && user) {
        console.log("New user detected or new social identity linked. Checking/creating/updating profile...");
        try {
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
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
                },
              ]);

            if (error) {
              console.error("Error creating user profile in public.profiles:", error);
            } else {
              console.log("User profile created successfully in public.profiles:", data);
            }
          } else {
            console.log("Profile already exists for this user ID, updating existing profile.");
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

      if (session.user.id) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user profile for session:", error);
          } else if (profile) {
            session.user.username = profile.username || null;
            session.user.role = profile.role || "user";
            session.user.membership_type = profile.membership_type || "free";
            session.user.avatar_url = profile.avatar_url || null;
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

  debug: process.env.NODE_ENV === "development",

  pages: {
    error: '/auth/error',
  },
};

export default NextAuth(authOptions);
