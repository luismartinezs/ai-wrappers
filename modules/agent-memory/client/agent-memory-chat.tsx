"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Chat } from "@/shared/chat/client/chat"
import { Message } from "@/shared/chat/types/chat-types"
import { sendPromptAction } from "../server/prompt-actions"

export function AgentMemoryChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true)

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content,
        createdAt: new Date()
      }
      setMessages((prev) => [...prev, userMessage])

      // Get response from LLM
      const response = await sendPromptAction(content)

      if (!response.isSuccess) {
        throw new Error(response.message)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response.data.content,
        createdAt: new Date()
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      // You might want to show an error toast here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[600px] w-full flex-col rounded-lg border">
      <Chat
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />
    </div>
  )
}