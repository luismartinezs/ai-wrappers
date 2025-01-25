"use client"

import { cn } from "@/shared/utils/cn"
import { Message } from "../types/chat-types"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex w-full gap-2 p-4",
        isUser ? "bg-background" : "bg-muted"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
        <div className="text-sm">{isUser ? "U" : "A"}</div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="prose break-words dark:prose-invert">
          {message.content}
        </div>
      </div>
    </div>
  )
}