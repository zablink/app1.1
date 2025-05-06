import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { AdapterUser } from 'next-auth/adapters';

async function refreshAccessToken(token: any) {
  try {
    const url = 'https://graph.facebook.com/oauth/access_token' +
      `?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_ID}` +
      `&client_secret=${process.env.FACEBOOK_SECRET}` +
      `&fb_exchange_token=${token.accessToken}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID!,
      clientSecret: process.env.FACEBOOK_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.id = user.id;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const supabase = createPagesServerClient({ req: {} as NextApiRequest, res: {} as NextApiResponse });
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        await supabase.from('users').insert([
          {
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'user',
          },
        ]);
      }
    },
  },
};

export default NextAuth(authOptions);
