
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import type { AdapterUser } from 'next-auth/adapters';

const allowedRoles = ["user", "store", "admin"] as const;
const allowedMembershipTypes = ["free", "pro1", "pro2", "pro3", "special"] as const;

type Role = (typeof allowedRoles)[number];
type MembershipType = (typeof allowedMembershipTypes)[number];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  }),
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as AdapterUser & { role?: string }).role;
        token.membershipType = (user as AdapterUser & { membershipType?: string }).membershipType;
      }

      if (account) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        if (allowedRoles.includes(token.role as Role)) {
          session.user.role = token.role as Role;
        }

        if (allowedMembershipTypes.includes(token.membershipType as MembershipType)) {
          session.user.membershipType = token.membershipType as MembershipType;
        }

        session.user.provider = token.provider as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
