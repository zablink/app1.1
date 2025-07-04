import { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters";
import { createClient } from "@supabase/supabase-js";

export function CustomSupabaseAdapter({
  url,
  secret,
}: {
  url: string;
  secret: string;
}): Adapter {
  const client = createClient(url, secret);

  return {
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const { data, error } = await client
        .from("nextauth_users")
        .insert(user)
        .select()
        .single();
      if (error) throw error;
      return data as AdapterUser;
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const { data, error } = await client
        .from("nextauth_users")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) return null;
      return data as AdapterUser;
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const { data, error } = await client
        .from("nextauth_users")
        .select("*")
        .eq("email", email)
        .single();
      if (error || !data) return null;
      return data as AdapterUser;
    },

    async getUserByAccount({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }): Promise<AdapterUser | null> {
      const { data, error } = await client
        .from("nextauth_accounts")
        .select("user_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();
      if (error || !data?.user_id) return null;

      const { data: user, error: userError } = await client
        .from("nextauth_users")
        .select("*")
        .eq("id", data.user_id)
        .single();
      if (userError || !user) return null;
      return user as AdapterUser;
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
      const { data, error } = await client
        .from("nextauth_users")
        .update(user)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data as AdapterUser;
    },

    async deleteUser(userId: string): Promise<void> {
      const { error } = await client.from("nextauth_users").delete().eq("id", userId);
      if (error) throw error;
    },

    async linkAccount(account: AdapterAccount): Promise<void> {
      const { error } = await client.from("nextauth_accounts").insert(account);
      if (error) throw error;
    },

    async unlinkAccount(params: {
      provider: string;
      providerAccountId: string;
    }): Promise<void> {
      const { error } = await client
        .from("nextauth_accounts")
        .delete()
        .eq("provider", params.provider)
        .eq("provider_account_id", params.providerAccountId);
      if (error) throw error;
    },

    async createSession(session: AdapterSession): Promise<AdapterSession> {
      const { data, error } = await client
        .from("nextauth_sessions")
        .insert(session)
        .select()
        .single();
      if (error) throw error;
      return data as AdapterSession;
    },

    async getSessionAndUser(
      sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
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

      return {
        session: session as AdapterSession,
        user: user as AdapterUser,
      };
    },

    async updateSession(session: Partial<AdapterSession> & { session_token: string }): Promise<AdapterSession | null> {
      const { data, error } = await client
        .from("nextauth_sessions")
        .update(session)
        .eq("session_token", session.session_token)
        .select()
        .single();
      if (error || !data) return null;
      return data as AdapterSession;
    },

    async deleteSession(sessionToken: string): Promise<void> {
      const { error } = await client
        .from("nextauth_sessions")
        .delete()
        .eq("session_token", sessionToken);
      if (error) throw error;
    },

    async createVerificationToken(token: VerificationToken): Promise<VerificationToken> {
      const { data, error } = await client
        .from("nextauth_verification_tokens")
        .insert(token)
        .select()
        .single();
      if (error) throw error;
      return data as VerificationToken;
    },

    async useVerificationToken(params: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      const { data, error } = await client
        .from("nextauth_verification_tokens")
        .delete()
        .match(params)
        .select()
        .single();
      if (error || !data) return null;
      return data as VerificationToken;
    },
  };
}
