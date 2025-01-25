"use client"

import { useCallback, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Chat } from "@/shared/chat/client/chat"
import { Message } from "@/shared/chat/types/chat-types"
import { createConversationAction, getConversationAction, sendMessageAction } from "../server/memory-actions"
import { AgentMemorySidebar } from "./agent-memory-sidebar"
import { logger } from "@/shared/utils/logger"

export function AgentMemoryChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [shouldRefreshList, setShouldRefreshList] = useState(false)

  // Load messages when conversation ID changes
  useEffect(() => {
    async function loadConversation() {
      if (!conversationId) {
        setMessages([])
        return
      }

      try {
        setIsLoading(true)
        const result = await getConversationAction(conversationId)

        if (!result.isSuccess || !Array.isArray(result.data)) {
          setMessages([])
          return
        }

        setMessages(
          result.data.map((msg) => ({
            id: uuidv4(),
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
          }))
        )
      } catch (error) {
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [conversationId])

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true)

      // Create a new conversation if none exists
      let currentConversationId = conversationId
      if (!currentConversationId) {
        const result = await createConversationAction()
        if (!result.isSuccess) {
          return
        }
        currentConversationId = result.data.id
        setConversationId(currentConversationId)
        setShouldRefreshList(true)
      }

      const response = await sendMessageAction(currentConversationId, content)

      if (!response.isSuccess) {
        throw new Error(response.message)
      }

      // Add both messages to the UI
      const { userMessage, assistantMessage } = response.data
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: userMessage.role,
          content: userMessage.content,
          createdAt: userMessage.createdAt ? new Date(userMessage.createdAt) : new Date()
        },
        {
          id: uuidv4(),
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt ? new Date(assistantMessage.createdAt) : new Date()
        }
      ])

      // Trigger list refresh after first message exchange (when title is generated)
      if (messages.length === 0) {
        setShouldRefreshList(true)
      }
    } catch (error) {
      // Error already logged by server action
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectConversation = useCallback((id: string) => {
    if (id === conversationId || isLoading) return
    setConversationId(id)
  }, [conversationId, isLoading])

  const handleNewChat = useCallback(() => {
    setConversationId(undefined)
    setMessages([])
  }, [])

  return (
    <div className="flex h-[600px] w-full">
      <AgentMemorySidebar
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        currentConversationId={conversationId}
        shouldRefreshList={shouldRefreshList}
        onListRefreshed={() => setShouldRefreshList(false)}
      />
      <div className="flex-1">
        <Chat
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}