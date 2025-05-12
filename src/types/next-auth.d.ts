//import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { 
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "user" | "store" | "admin"; // 👈 เพิ่ม role
      membershipType?: "free" | "pro1" | "pro2" | "pro3" | "special"; // 👈 เพิ่มระดับร้านค้า
    };
  }

  interface User {
    role?: "user" | "store" | "admin";
    membershipType?: "free" | "pro1" | "pro2" | "pro3" | "special";
  }
}
