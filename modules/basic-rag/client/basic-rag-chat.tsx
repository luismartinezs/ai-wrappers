"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"
import { MessageSquarePlus } from "lucide-react"
import { useRag } from "./rag-context"
import { createChatAction } from "../server/chat-actions"
import { createMessageAction, getMessagesAction } from "../server/message-actions"
import { SerializedRagMessage } from "../models/message"
import { MarkdownContent } from "@/shared/components/markdown-content"

export function BasicRagChat() {
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState<SerializedRagMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const { data: session } = useSession()
  const { selectedNamespace, selectedChat, setSelectedChat } = useRag()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Load messages when chat is selected
  React.useEffect(() => {
    async function loadMessages() {
      if (!selectedChat) {
        setMessages([])
        return
      }

      const result = await getMessagesAction(selectedChat._id)
      if (result.success && result.data) {
        setMessages(result.data)
      }
    }

    loadMessages()
  }, [selectedChat])

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email || !selectedNamespace || !message.trim() || isLoading) return

    setIsLoading(true)
    try {
      let currentChat = selectedChat
      // If no chat is selected, create a new one
      if (!currentChat) {
        const result = await createChatAction(session.user.email, selectedNamespace._id, "New Chat")
        if (result.success) {
          currentChat = result.data
          setSelectedChat(result.data)
        } else {
          console.error("Failed to create chat:", result.message)
          return
        }
      }

      // Send message
      const messageResult = await createMessageAction({
        sender: "user",
        content: message.trim(),
        chatId: currentChat._id,
        namespaceId: selectedNamespace._id,
        userEmail: session.user.email
      })

      if (messageResult.success) {
        setMessage("")
        // Refresh messages
        const updatedMessages = await getMessagesAction(currentChat._id)
        if (updatedMessages.success && updatedMessages.data) {
          setMessages(updatedMessages.data)
        }
      } else {
        console.error("Failed to send message:", messageResult.message)
      }
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
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start a conversation by typing a message below.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <MarkdownContent content={msg.content} />
                  {msg.sourceDocs && msg.sourceDocs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <p className="font-semibold">Sources:</p>
                      <ul className="list-disc list-inside">
                        {msg.sourceDocs.map((doc, index) => (
                          <li key={index}>
                            {doc.filename} - {doc.source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-4">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !message.trim()}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  )
}