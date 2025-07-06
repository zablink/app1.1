// pages/settings/account.tsx
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [allProviders, setAllProviders] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      const providers = await getProviders();
      setAllProviders(providers ?? {});

      const res = await fetch("/api/user/linked-providers");
      const data = await res.json();
      setLinkedProviders(data || []);
    };
    fetchData();
  }, []);

  const isLinked = (provider: string) => linkedProviders.includes(provider);

  const handleLink = async (provider: string) => {
    await signIn(provider, { callbackUrl: "/settings/account" });
  };

  const handleUnlink = async (provider: string) => {
    const res = await fetch(`/api/user/unlink-provider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });

    if (res.ok) {
      setLinkedProviders(linkedProviders.filter((p) => p !== provider));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>⚙️ การเชื่อมต่อบัญชี</h1>
      {session?.user ? (
        <>
          <p>คุณเข้าสู่ระบบด้วย: <strong>{session.user.provider}</strong></p>
          <ul style={{ marginTop: "1rem" }}>
            {Object.keys(allProviders).map((provider) => {
              if (provider === "credentials") return null;
              const isCurrent = session.user.provider === provider;
              return (
                <li key={provider} style={{ marginBottom: "1rem" }}>
                  <span style={{ marginRight: "1rem" }}>{provider}</span>
                  {isLinked(provider) ? (
                    isCurrent ? (
                      <em>(ใช้บัญชีนี้)</em>
                    ) : (
                      <button onClick={() => handleUnlink(provider)}>
                        ❌ ยกเลิกการเชื่อมต่อ
                      </button>
                    )
                  ) : (
                    <button onClick={() => handleLink(provider)}>
                      🔗 เชื่อมต่อ
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Link href="/">← กลับหน้าแรก</Link>
        </>
      ) : (
        <p>กรุณาเข้าสู่ระบบก่อน</p>
      )}
    </div>
  );
}
