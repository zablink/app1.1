// hooks/useRequireCompleteProfile.ts
import { useEffect } from "react";
import { useRouter } from "next/router";

export function useRequireCompleteProfile() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/check-profile");
      const data = await res.json();

      console.log("🟢 useRequireCompleteProfile:", data);

      if (!data.isComplete) {
        router.replace("/complete-profile");
      }
    };

    check();
  }, []);
}
