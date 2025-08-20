// /types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "shop" | "admin";
      membership_type: string;
      avatar_url: string | null;
      isNewUser: boolean;
      provider: string | null;
      username?: string;
      points?: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "user" | "shop" | "admin";
    membership_type?: string;
    avatar_url?: string | null;
    isNewUser?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "shop" | "admin";
    membership_type: string;
    avatar_url: string | null;
    isNewUser: boolean;
    provider: string | null;
    username?: string;
    points?: number;
  }
}
