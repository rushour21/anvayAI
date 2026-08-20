"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ChatContainer from "@/components/chat/ChatContainer";
import InputCard from "@/components/input/InputCard";
import { useChatStore } from "@/stores/chatStore";

/** Consumes the `?q=` handed over from the landing hero, exactly once. */
function QueryHandoff() {
  const params = useSearchParams();
  const sendMessage = useChatStore((s) => s.sendMessage);
  const fired = useRef(false);

  useEffect(() => {
    const q = params.get("q")?.trim();
    if (!q || fired.current) return;
    fired.current = true;
    sendMessage(q);
    /* Drop the param so a refresh doesn't re-ask the same question. */
    window.history.replaceState(null, "", window.location.pathname);
  }, [params, sendMessage]);

  return null;
}

export default function ChatIdPage() {
  return (
    <>
      <Suspense fallback={null}>
        <QueryHandoff />
      </Suspense>
      <ChatContainer />
      <InputCard />
    </>
  );
}
