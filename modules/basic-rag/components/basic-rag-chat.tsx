"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"
import { MessageSquarePlus } from "lucide-react"
import { useRag } from "../context/rag-context"
import { createChatAction } from "../server/chat-actions"

export function BasicRagChat() {
  const [message, setMessage] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { data: session } = useSession()
  const { selectedNamespace, selectedChat, setSelectedChat } = useRag()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email || !selectedNamespace || !message.trim() || isLoading) return

    setIsLoading(true)
    try {
      // If no chat is selected, create a new one
      if (!selectedChat) {
        const result = await createChatAction(session.user.email, selectedNamespace._id, "New Chat")
        if (result.success) {
          setSelectedChat(result.data)
        } else {
          console.error("Failed to create chat:", result.message)
          return
        }
      }

      // TODO: Send message
      setMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedNamespace) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-muted p-4 rounded-full mb-4">
          <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">No Namespace Selected</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Each namespace represents a separate context for your conversations. Select or create a namespace to start chatting.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4">
        {/* TODO: Show messages */}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !message.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}