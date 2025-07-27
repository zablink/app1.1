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
        console.log('--- NextAuth authorize callback triggered ---');
        console.log('Received credentials:', credentials?.email); // Log email for debugging

        if (!credentials?.email || !credentials?.password) {
          console.warn('Authorize failed: Email or password missing.');
          return null;
        }

        try {
          // 1. Authenticate with Supabase Auth
          const { data, error } = await supabaseForCallbacks.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase signInWithPassword error (in NextAuth CredentialsProvider):", error.message);
            // Don't throw new Error here as it might prevent NextAuth from showing specific error messages
            return null; // Return null on auth error
          }

          if (data.user) {
            console.log("Supabase signInWithPassword successful. User ID:", data.user.id);

            // 2. Fetch user profile data from your 'profiles' table
            // This is crucial for getting 'role' and 'membership_type'
            const { data: profile, error: profileError } = await supabaseForCallbacks
              .from('profiles')
              .select('id, name, email, role, membership_type, avatar_url') // Select all necessary fields
              .eq('id', data.user.id) // Match by user ID
              .single(); // Expect only one result

            if (profileError || !profile) {
              console.error("Error fetching user profile from 'profiles' table:", profileError?.message || "Profile not found after sign-in.");
              return null; // If profile is not found or error, return null
            }

            console.log("Fetched user profile data:", profile);

            // 3. Return user object for NextAuth
            // This object will be passed to the jwt callback
            return {
              id: profile.id,
              email: profile.email,
              name: profile.name || profile.email?.split('@')[0] || 'User', // Use name from profile, fallback to email part
              image: profile.avatar_url || null, // Use avatar_url from profile
              role: profile.role || "user", // Use role from profile, fallback to "user"
              membership_type: profile.membership_type || "free", // Use membership_type from profile, fallback to "free"
            };
          } else {
            console.warn("Supabase signInWithPassword returned no user data (in CredentialsProvider).");
            return null; // No user data means authentication failed
          }
        } catch (e: any) {
          console.error("Authorize function caught an unexpected exception (in CredentialsProvider):", e.message);
          return null;
        }
      },
    }),
  ],

  // --- Supabase Adapter ---
  // The adapter connects NextAuth to your Supabase database for session and user management.
  // Ensure your Supabase database has the tables required by the adapter (users, accounts, sessions, verification_tokens).
  // These are typically managed by NextAuth-Supabase adapter directly.
  adapter: SupabaseAdapter({
    url: NEXT_PUBLIC_SUPABASE_URL,
    secret: SUPABASE_SERVICE_ROLE_KEY,
  }),
  secret: NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // Required for adapter usage with callbacks
  },

  // --- Callbacks ---
  // Callbacks allow you to control what happens when an action is performed.
  callbacks: {
    // This signIn callback is typically used for additional checks before allowing sign-in
    async signIn({ user, account, profile, email }) {
      console.log('--- NextAuth signIn callback triggered ---');
      console.log('User attempting to sign in:', user?.email);
      // For CredentialsProvider, `user` here is the object returned from `authorize`
      // For other providers (Google, GitHub), `profile` contains data from the OAuth provider.
      
      // If using SupabaseAdapter, the user might be inserted into NextAuth's internal 'users' table here.
      // We generally allow all successful authentications at this stage unless specific blocking logic is needed.
      return true; // Return true to allow sign-in, false to deny
    },

    // The jwt callback is responsible for populating the JWT (JSON Web Token)
    // This token is then used by the session callback.
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log('--- NextAuth JWT callback triggered ---');
      // console.log('JWT User:', user?.email, 'Token:', token);

      if (user) {
        // 'user' object comes from the 'authorize' method (for Credentials)
        // or from the OAuth provider (for Google/GitHub) after it's processed.
        // It should already contain 'id', 'name', 'email', 'image', 'role', 'membership_type'
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image; // Using 'picture' for avatar URL in JWT
        // Type assertion to access custom properties
        token.role = (user as any).role; 
        token.membership_type = (user as any).membership_type;
      } else if (account?.provider === "google" || account?.provider === "github") {
        // --- Handle OAuth Provider Logins (Google, GitHub) ---
        // If user logs in with OAuth, we need to fetch their profile details
        // from our 'profiles' table, similar to CredentialsProvider.
        // This ensures 'role' and 'membership_type' are included for OAuth users too.
        if (token.sub) { // 'sub' is the user ID from the provider/NextAuth
            console.log(`Fetching profile for OAuth user ID: ${token.sub}`);
            const { data: profile, error: profileError } = await supabaseForCallbacks
                .from('profiles')
                .select('id, name, email, role, membership_type, avatar_url')
                .eq('id', token.sub) // Match by id (which is token.sub for OAuth users here)
                .single();

            if (profileError || !profile) {
                console.error("Error fetching OAuth user profile:", profileError?.message || "Profile not found for OAuth user.");
                // Optionally, create a default profile for new OAuth users here if not done during signup/creation
                if (isNewUser) {
                    console.log("Creating default profile for new OAuth user:", token.email);
                    const { error: newProfileError } = await supabaseForCallbacks
                        .from('profiles')
                        .insert({
                            id: token.sub,
                            email: token.email,
                            name: token.name,
                            avatar_url: token.picture,
                            role: 'user', // Default role for new OAuth users
                            membership_type: 'free'
                        });
                    if (newProfileError) {
                        console.error("Failed to create default profile for new OAuth user:", newProfileError.message);
                    }
                }
                // Even if profile fetch/creation fails, proceed with basic token data
                token.role = 'user'; // Ensure a default role even on error
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

      // Ensure 'role' and 'membership_type' always have a fallback in the token
      // This is helpful if they are undefined for any reason (e.g., old users without a role)
      if (!token.role) {
          token.role = "user";
      }
      if (!token.membership_type) {
          token.membership_type = "free";
      }

      return token;
    },

    // The session callback populates the session object that is accessible on the client-side via useSession().
    async session({ session, token, user }) {
      console.log('--- NextAuth Session callback triggered ---');
      // console.log('Session Token:', token, 'Session User (from Adapter):', user);

      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string; // Populate session.user.image from token.picture
        // Populate custom fields from token to session.user
        session.user.role = (token.role as string); // No fallback needed here as it's handled in jwt callback
        session.user.membership_type = (token.membership_type as string); // No fallback needed here
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: '/login', // Make sure this points to your custom login page
    error: '/auth/error', // Optional: Redirect for authentication errors
  },
  
  // Custom type definitions for NextAuth to extend session and JWT types
  // You would typically declare this in a separate .d.ts file, e.g., types/next-auth.d.ts
  // For quick testing, you can add it here.
  // interface User {
  //   id: string;
  //   name?: string | null;
  //   email?: string | null;
  //   image?: string | null;
  //   role?: string | null;
  //   membership_type?: string | null;
  // }

  // interface Session {
  //   user: {
  //     id: string;
  //     name?: string | null;
  //     email?: string | null;
  //     image?: string | null;
  //     role?: string | null;
  //     membership_type?: string | null;
  //   } & DefaultSession['user'];
  // }
  // You might also need to extend the NextAuth.JWT interface for custom token properties.
  // For full type safety, put these in a global declaration file.
};

export default NextAuth(authOptions);