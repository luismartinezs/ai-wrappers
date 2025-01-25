"use client"

import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"
import { SendHorizontal } from "lucide-react"
import { useRef, useState } from "react"

interface ChatInputProps {
  onSendMessage: (message: string) => void | Promise<void>
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    await onSendMessage(message)
    setMessage("")
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-end gap-2 p-4">
      <Textarea
        ref={textareaRef}
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="min-h-[60px] resize-none"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isLoading}
        className="h-[60px] w-[60px]"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </form>
  )
}