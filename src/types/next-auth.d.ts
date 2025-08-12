// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      role: "user" | "shop" | "admin";
      membership_type: "free" | "pro1" | "pro2" | "pro3" | "special"; // <-- แก้ไขตรงนี้: เปลี่ยนเป็น membership_type
      avatar_url?: string | null;
      provider?: string;
      isNewUser?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username?: string | null;
    role: "user" | "shop" | "admin";
    membership_type: "free" | "pro1" | "pro2" | "pro3" | "special"; // <-- แก้ไขตรงนี้: เปลี่ยนเป็น membership_type
    avatar_url?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    username?: string | null;
    role?: "user" | "shop" | "admin";
    membership_type?: "free" | "pro1" | "pro2" | "pro3" | "special"; // <-- แก้ไขตรงนี้: เปลี่ยนเป็น membership_type
    avatar_url?: string | null;
    provider?: string;
    isNewUser?: boolean;
  }
}
  