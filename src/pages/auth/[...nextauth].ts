// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        const { data: existingProviders } = await supabase.rpc("check_email_providers", {
          email_to_check: user.email,
        });
        if (existingProviders?.length && account?.provider !== existingProviders[0].provider) {
          return `/auth/existing-account?email=${encodeURIComponent(user.email)}&provider=${existingProviders[0].provider}`;
        }
        return true;
      } catch (e) {
        console.error("signIn error:", e);
        return false;
      }
    },

    async jwt({ token, user, account, isNewUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";
        token.membership_type = user.membership_type ?? "free";
        token.avatar_url = user.avatar_url ?? user.image ?? null;
        token.isNewUser = isNewUser ?? false;
        token.provider = account?.provider ?? null;

        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          await supabase.from("users").insert({
            id: user.id,
            username:
              (user.name?.toLowerCase().replace(/\s+/g, "_") ?? "user") +
              "_" +
              Math.random().toString(36).substring(2, 7),
            role: "user",
            membership_type: "free",
            avatar_url: user.image,
            points: 0,
            is_active: true,
            last_login_at: new Date().toISOString(),
          });
          await supabase.from("user_settings").insert({ user_id: user.id });
          token.isNewUser = true;
        } else {
          await supabase.from("users").update({
            last_login_at: new Date().toISOString(),
            avatar_url: user.image,
          }).eq("id", user.id);
          token.role = existingUser.role ?? "user";
          token.membership_type = existingUser.membership_type ?? "free";
          token.avatar_url = existingUser.avatar_url ?? user.image ?? null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role ?? "user";
        session.user.membership_type = token.membership_type ?? "free";
        session.user.avatar_url = token.avatar_url ?? null;
        session.user.provider = token.provider ?? null;
        session.user.isNewUser = token.isNewUser ?? false;

        const { data: userData } = await supabase
          .from("users")
          .select("username, role, membership_type, avatar_url, points")
          .eq("id", token.id)
          .single();

        if (userData) {
          session.user.username = userData.username;
          session.user.role = userData.role;
          session.user.membership_type = userData.membership_type;
          session.user.avatar_url = userData.avatar_url;
          session.user.points = userData.points ?? 0;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/auth/existing-account")) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/auth/welcome",
  },

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
export default NextAuth(authOptions);
