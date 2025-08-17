declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    membership_type?: string;
    avatar_url?: string | null;   // 👈 เพิ่ม null
    isNewUser?: boolean;
    provider?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      membership_type?: string;
      avatar_url?: string | null; // 👈 เพิ่ม null
      isNewUser?: boolean;
      provider?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    membership_type?: string;
    avatar_url?: string | null;   // 👈 เพิ่ม null
    isNewUser?: boolean;
  }
}
