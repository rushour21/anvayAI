"use client";

import { Suspense, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  const { chatId } = useParams<{ chatId: string }>();
  const clearMessages = useChatStore((s) => s.clearMessages);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);
  const loadConversation = useChatStore((s) => s.loadConversation);
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRef.current === chatId) return;
    loadedRef.current = chatId;
    if (chatId === "new") {
      clearMessages();
      setActiveChatId(null);
    } else {
      loadConversation(chatId);
    }
  }, [chatId, clearMessages, setActiveChatId, loadConversation]);

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
