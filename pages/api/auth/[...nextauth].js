import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import supabase from '../../../lib/supabase';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();
        if (data && credentials.password === data.password) {
          return { id: data.id, email: data.email, role: data.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});