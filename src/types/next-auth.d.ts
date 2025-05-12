//import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { 
      id?: string; // เพิ่ม id สำหรับ session
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "user" | "store" | "admin";
      membershipType?: "free" | "pro1" | "pro2" | "pro3" | "special";
    };
  }

  interface User {
    id?: string; // เพิ่ม id ใน user
    role?: "user" | "store" | "admin";
    membershipType?: "free" | "pro1" | "pro2" | "pro3" | "special";
  }
}
