"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import Icon from "@/components/ui/Icon";

export default function NewChatButton() {
  const router = useRouter();
  const clearMessages = useChatStore((s) => s.clearMessages);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  return (
    <button
      onClick={() => {
        clearMessages();
        setActiveChatId(null);
        router.push("/chat/new");
      }}
      className="btn btn-primary w-full py-2.5 text-[14px]"
    >
      <Icon name="plus" size={16} strokeWidth={2.2} />
      New chat
    </button>
  );
}
