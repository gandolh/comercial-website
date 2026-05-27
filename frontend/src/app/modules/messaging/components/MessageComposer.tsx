import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageComposer: React.FC<Props> = ({
  onSend,
  disabled,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!body.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(body);
      setBody("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [body]);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-surface-container-lowest border-t border-surface-container-low flex items-end gap-2"
    >
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t("common:messaging.type_message")}
        disabled={disabled || isSending}
        className="flex-1 max-h-32 p-3 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
        rows={1}
      />
      <button
        type="submit"
        disabled={!body.trim() || disabled || isSending}
        className="p-2 bg-primary text-on-primary rounded-full hover:opacity-90 disabled:opacity-30 transition-opacity flex-shrink-0"
      >
        <span className="material-symbols-outlined text-xl">send</span>
      </button>
    </form>
  );
};
