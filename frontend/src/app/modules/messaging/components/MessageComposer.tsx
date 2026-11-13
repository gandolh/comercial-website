import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageComposer: React.FC<Props> = ({ onSend, disabled, placeholder }) => {
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
      void handleSubmit();
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
      onSubmit={(e) => void handleSubmit(e)}
      className="flex items-end gap-2 border-t border-surface-container-low bg-surface-container-lowest p-4"
    >
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t("common:messaging.type_message")}
        disabled={disabled || isSending}
        className="max-h-32 flex-1 resize-none rounded-xl bg-surface-container-low p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
        rows={1}
      />
      <button
        type="submit"
        disabled={!body.trim() || disabled || isSending}
        className="shrink-0 rounded-full bg-primary p-2 text-on-primary transition-opacity hover:opacity-90 disabled:opacity-30"
      >
        <span className="material-symbols-outlined text-xl">send</span>
      </button>
    </form>
  );
};
