// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

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
