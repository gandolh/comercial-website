import React from "react";
import type { MessageResponse } from "../services/messaging";
import { format } from "date-fns";

interface Props {
  message: MessageResponse;
  isMe: boolean;
}

export const MessageBubble: React.FC<Props> = ({ message, isMe }) => {
  return (
    <div className={`mb-4 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl p-3 text-sm ${
          isMe ? "rounded-br-none bg-primary text-on-primary" : "rounded-bl-none bg-surface-container text-on-surface"
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.body}</p>
      </div>
      <span className="mt-1 text-[10px] text-on-surface-variant">{format(new Date(message.created_at), "HH:mm")}</span>
    </div>
  );
};
