"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

/* middleware.ts is the real gate now (Phase B, docs/AUTH-PLAN.md) — it
   reads the session cookie at the edge and redirects before this component
   ever renders. This stays for two things middleware can't do: populate
   authStore.user for the UI (name, plan, etc.) and show a loading state
   while that fetch is in flight. Its own redirect is belt-and-suspenders,
   not the primary defense. */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div
        className="flex h-dvh items-center justify-center"
        style={{ background: "var(--paper)" }}
      >
        <span
          className="rounded-full animate-spin"
          style={{
            width: 22,
            height: 22,
            border: "2px solid var(--line)",
            borderTopColor: "var(--blue-500)",
            animationDuration: "0.8s",
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
