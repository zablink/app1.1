import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "user" | "shop" | "admin";
      membership_type?: string;
      avatar_url?: string | null; // 👈 เพิ่ม null
      isNewUser?: boolean;
      provider?: string | null ;
    } & DefaultSession["user"];
  }

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: "user" | "shop" | "admin";
    membership_type?: string;
    avatar_url?: string | null;   // 👈 เพิ่ม null
    isNewUser?: boolean;
    provider?: string | null;
  }
}



  interface User extends DefaultUser {
    role?: string;
    membership_type?: string;
    avatar_url?: string | null;   // 👈 เพิ่ม null
    isNewUser?: boolean;
  }
}
