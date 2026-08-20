"use client";

import Icon from "@/components/ui/Icon";

export default function SendButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      aria-label="Send message"
      className="btn-orb shrink-0"
      style={{ width: 34, height: 34 }}
    >
      <Icon name="arrowUp" size={16} strokeWidth={2.2} />
    </button>
  );
}
