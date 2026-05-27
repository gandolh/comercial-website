import React from "react";
import type { MessageResponse } from "../services/messaging";
import { format } from "date-fns";

interface Props {
  message: MessageResponse;
  isMe: boolean;
}

export const MessageBubble: React.FC<Props> = ({ message, isMe }) => {
  return (
    <div className={`flex flex-col mb-4 ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] p-3 rounded-2xl text-sm ${
          isMe
            ? "bg-primary text-on-primary rounded-br-none"
            : "bg-surface-container text-on-surface rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      </div>
      <span className="text-[10px] text-on-surface-variant mt-1">
        {format(new Date(message.created_at), "HH:mm")}
      </span>
    </div>
  );
};
