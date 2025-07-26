// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Ensure these environment variables are checked outside the main export if not already.
// For demonstration, assuming they are correctly configured.
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data, error } = await supabaseForCallbacks.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase signInWithPassword error (in NextAuth CredentialsProvider):", error.message);
            throw new Error(error.message);
          }

          if (data.user) {
            console.log("Supabase signInWithPassword successful. User (from CredentialsProvider):", data.user);
            // Ensure user_metadata is correctly populated in Supabase for these fields
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email,
              image: data.user.user_metadata?.avatar_url || null,
              // Assuming 'role' and 'membership_type' are stored in user_metadata or profiles table
              // In a real app, you'd fetch these from your 'profiles' table using data.user.id
              // For now, using user_metadata or a default for demonstration
              // @ts-ignore
              role: data.user.user_metadata?.role || "user",
              // @ts-ignore
              membership_type: data.user.user_metadata?.membership_type || "free",
            };
          } else {
            console.warn("Supabase signInWithPassword returned no user data (in CredentialsProvider).");
            return null;
          }
        } catch (e: any) {
          console.error("Authorize function caught an exception (in CredentialsProvider):", e.message);
          return null;
        }
      },
    }),
  ],

  adapter: SupabaseAdapter({
    url: NEXT_PUBLIC_SUPABASE_URL,
    // แก้ไข: เปลี่ยน serviceRoleKey เป็น secret
    secret: SUPABASE_SERVICE_ROLE_KEY, 
  }),
  secret: NEXTAUTH_SECRET, // This is the NextAuth secret, not Supabase secret

  callbacks: {
    async signIn({ user, account, profile, email }) {
      // This callback runs after a successful authentication.
      return true;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      // The `user` object is only available the first time this callback is called on a new session.
      // After that, `token` is passed between subsequent calls.
      if (user) {
        // This 'user' object comes from the 'signIn' callback or the provider's 'authorize' method.
        // It should contain 'id', 'name', 'email', 'image', 'role', 'membership_type'
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image; // Use 'picture' for avatar URL in JWT
        // @ts-ignore // Suppress TypeScript error if 'role' is not in default User type
        token.role = user.role;
        // @ts-ignore // Suppress TypeScript error if 'membership_type' is not in default User type
        token.membership_type = user.membership_type;
      }
      return token;
    },

    async session({ session, token, user }) {
      // The `session` object is what gets sent to the client.
      // We populate `session.user` with data from the `token`.
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture; // Populate session.user.image from token.picture
        // @ts-ignore // Suppress TypeScript error if 'role' is not in default SessionUser type
        session.user.role = token.role;
        // @ts-ignore // Suppress TypeScript error if 'membership_type' is not in default SessionUser type
        session.user.membership_type = token.membership_type;
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",

  pages: {
    error: '/auth/error',
  },
};

export default NextAuth(authOptions);
