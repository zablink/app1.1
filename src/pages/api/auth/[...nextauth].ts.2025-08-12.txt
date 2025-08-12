// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ตรวจสอบตัวแปรสภาพแวดล้อม
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables for NextAuth callbacks.");
}
if (!NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable.");
}

const supabaseForCallbacks = createSupabaseClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('--- NextAuth authorize callback triggered ---');
        console.log('Received credentials:', credentials?.email); // Log email for debugging

        if (!credentials?.email || !credentials?.password) {
          console.warn('Authorize failed: Email or password missing. Returning null.');
          return null;
        }

        try {
          console.log('Attempting Supabase signInWithPassword...');
          // 1. Authenticate with Supabase Auth
          const { data, error } = await supabaseForCallbacks.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase signInWithPassword error (in NextAuth CredentialsProvider):", error.message);
            console.error("Supabase Auth Error Code:", error.code); // เพิ่มการแสดงโค้ดข้อผิดพลาด
            console.error("Supabase Auth Error Status:", error.status); // เพิ่มการแสดงสถานะข้อผิดพลาด
            console.warn("Returning null due to Supabase authentication error.");
            return null; // Return null on auth error
          }

          if (data.user) {
            console.log("Supabase signInWithPassword successful. User ID:", data.user.id);
            console.log("Attempting to fetch user profile from 'profiles' table...");

            // 2. Fetch user profile data from your 'profiles' table
            const { data: profile, error: profileError } = await supabaseForCallbacks
              .from('profiles')
              .select('id, name, email, role, membership_type, avatar_url')
              .eq('id', data.user.id)
              .single();

            if (profileError || !profile) {
              console.error("Error fetching user profile from 'profiles' table:", profileError?.message || "Profile not found after sign-in.");
              console.warn("Returning null due to profile fetch error or profile not found.");
              return null; // If profile is not found or error, return null
            }

            console.log("Fetched user profile data successfully:", profile);
            console.log("Returning user object for NextAuth:", {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                image: profile.avatar_url,
                role: profile.role,
                membership_type: profile.membership_type
            });
            // 3. Return user object for NextAuth
            return {
              id: profile.id,
              email: profile.email,
              name: profile.name || profile.email?.split('@')[0] || 'User',
              image: profile.avatar_url || null,
              role: profile.role || "user",
              membership_type: profile.membership_type || "free",
            };
          } else {
            console.warn("Supabase signInWithPassword returned no user data (in CredentialsProvider). Returning null.");
            return null; // No user data means authentication failed
          }
        } catch (e: any) {
          console.error("Authorize function caught an unexpected exception (in CredentialsProvider):", e.message);
          console.warn("Returning null due to unexpected exception.");
          return null;
        }
      },
    }),
  ],

  adapter: SupabaseAdapter({
    url: NEXT_PUBLIC_SUPABASE_URL,
    secret: SUPABASE_SERVICE_ROLE_KEY,
  }),
  secret: NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile, email }) {
      console.log('--- NextAuth signIn callback triggered ---');
      console.log('User attempting to sign in:', user?.email);
      return true;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      console.log('--- NextAuth JWT callback triggered ---');
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = (user as any).role; 
        token.membership_type = (user as any).membership_type;
      } else if (account?.provider === "google" || account?.provider === "github") {
        if (token.sub) {
            console.log(`Fetching profile for OAuth user ID: ${token.sub}`);
            const { data: profile, error: profileError } = await supabaseForCallbacks
                .from('profiles')
                .select('id, name, email, role, membership_type, avatar_url')
                .eq('id', token.sub)
                .single();

            if (profileError || !profile) {
                console.error("Error fetching OAuth user profile:", profileError?.message || "Profile not found for OAuth user.");
                if (isNewUser) {
                    console.log("Creating default profile for new OAuth user:", token.email);
                    const { error: newProfileError } = await supabaseForCallbacks
                        .from('profiles')
                        .insert({
                            id: token.sub,
                            email: token.email,
                            name: token.name,
                            avatar_url: token.picture,
                            role: 'user',
                            membership_type: 'free'
                        });
                    if (newProfileError) {
                        console.error("Failed to create default profile for new OAuth user:", newProfileError.message);
                    }
                }
                token.role = 'user';
                token.membership_type = 'free';
            } else {
                token.name = profile.name;
                token.email = profile.email;
                token.picture = profile.avatar_url;
                token.role = profile.role;
                token.membership_type = profile.membership_type;
            }
        }
      }

      if (!token.role) {
          token.role = "user";
      }
      if (!token.membership_type) {
          token.membership_type = "free";
      }

      return token;
    },

    async session({ session, token, user }) {
      console.log('--- NextAuth Session callback triggered ---');
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role ?? 'user'; 
        session.user.membership_type = token.membership_type ?? 'free';
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};

export default NextAuth(authOptions);
