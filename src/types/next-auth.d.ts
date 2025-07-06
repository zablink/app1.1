// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "store" | "admin";
      membershipType: "free" | "pro1" | "pro2" | "pro3" | "special";
      provider?: string;
      isNewUser?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "user" | "store" | "admin";
    membershipType: "free" | "pro1" | "pro2" | "pro3" | "special";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: "user" | "store" | "admin";
    membershipType?: "free" | "pro1" | "pro2" | "pro3" | "special";
    provider?: string;
    isNewUser?: boolean;
  }
}

