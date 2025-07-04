// lib/customSupabaseAdapter.ts
import { Adapter } from "next-auth/adapters";
import { createClient } from "@supabase/supabase-js";

export function CustomSupabaseAdapter({ url, secret }: { url: string; secret: string }): Adapter {
  const client = createClient(url, secret);

  return {
    async createUser(user) {
      const { data, error } = await client
        .from("nextauth_users")
        .insert(user)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getUser(id) {
      const { data, error } = await client
        .from("nextauth_users")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return null;
      return data;
    },

    async getUserByEmail(email) {
      const { data, error } = await client
        .from("nextauth_users")
        .select("*")
        .eq("email", email)
        .single();
      if (error) return null;
      return data;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const { data, error } = await client
        .from("nextauth_accounts")
        .select("user_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();
      if (error || !data) return null;

      return await client
        .from("nextauth_users")
        .select("*")
        .eq("id", data.user_id)
        .single()
        .then((res) => res.data);
    },

    async updateUser(user) {
      const { data, error } = await client
        .from("nextauth_users")
        .update(user)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async deleteUser(userId) {
      await client.from("nextauth_users").delete().eq("id", userId);
    },

    async linkAccount(account) {
      const { error } = await client.from("nextauth_accounts").insert(account);
      if (error) throw error;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await client
        .from("nextauth_accounts")
        .delete()
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId);
    },

    async createSession(session) {
      const { data, error } = await client
        .from("nextauth_sessions")
        .insert(session)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getSessionAndUser(sessionToken) {
      const { data: session, error: sessionError } = await client
        .from("nextauth_sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .single();
      if (sessionError || !session) return null;

      const { data: user, error: userError } = await client
        .from("nextauth_users")
        .select("*")
        .eq("id", session.user_id)
        .single();
      if (userError || !user) return null;

      return { session, user };
    },

    async updateSession(session) {
      const { data, error } = await client
        .from("nextauth_sessions")
        .update(session)
        .eq("session_token", session.session_token)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async deleteSession(sessionToken) {
      await client.from("nextauth_sessions").delete().eq("session_token", sessionToken);
    },

    async createVerificationToken(token) {
      const { data, error } = await client
        .from("nextauth_verification_tokens")
        .insert(token)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async useVerificationToken({ identifier, token }) {
      const { data, error } = await client
        .from("nextauth_verification_tokens")
        .delete()
        .match({ identifier, token })
        .select()
        .single();
      if (error) return null;
      return data;
    },
  };
}
