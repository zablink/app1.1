import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

const handler = NextAuth({
  providers: [
    // Credentials Login
    CredentialsProvider({ /* (เหมือนเดิม) */ }),

    // Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Facebook Login
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.email) {
        // OAuth Login: ตรวจ email ใน Supabase
        const { data: existingUser, error } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", user.email)
          .single();

        if (existingUser) {
          token.id = existingUser.id;
          token.role = existingUser.role;
        } else {
          // ❗ ไม่พบ → สมัครใหม่เป็น enduser
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              email: user.email,
              role: "enduser",
              created_at: new Date().toISOString(),
            })
            .select("id, role")
            .single();

          token.id = newUser?.id;
          token.role = newUser?.role ?? "enduser";
        }
      }

      // Credentials Login: มี user.role แล้ว
      if (user?.role) {
        token.role = user.role;
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
