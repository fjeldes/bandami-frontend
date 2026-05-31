"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      refreshSession().then((newToken) => {
        if (!newToken) {
          const currentToken = sessionStorage.getItem("access_token");
          if (!currentToken) {
            router.push("/login");
          }
        }
      });
    }, 30 * 60 * 1000);

    let visibleDebounce: ReturnType<typeof setTimeout> | null = null;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (visibleDebounce) clearTimeout(visibleDebounce);
      visibleDebounce = setTimeout(() => {
        refreshSession().then((newToken) => {
          if (!newToken) {
            const currentToken = sessionStorage.getItem("access_token");
            if (!currentToken) router.push("/login");
          }
        });
      }, 500);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      if (visibleDebounce) clearTimeout(visibleDebounce);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [accessToken, refreshSession, router]);

  return <>{children}</>;
}
