"use client"

import { useCallback, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Chat } from "@/shared/chat/client/chat"
import { Message } from "@/shared/chat/types/chat-types"
import { createConversationAction, getConversationAction, sendMessageAction } from "../server/memory-actions"
import { AgentMemorySidebar } from "./agent-memory-sidebar"

export function AgentMemoryChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [shouldRefreshList, setShouldRefreshList] = useState(false)

  // Load conversation when selected
  const loadMessages = useCallback(async (id: string) => {
    try {
      setIsLoadingConversation(true)
      const result = await getConversationAction(id)
      if (result.isSuccess) {
        setMessages(
          result.data.map((msg) => ({
            id: uuidv4(),
            role: msg.role,
            content: msg.content,
            createdAt: new Date(msg.createdAt)
          }))
        )
      } else {
        console.error("Failed to load conversation:", result.message)
        setMessages([])
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
      setMessages([])
    } finally {
      setIsLoadingConversation(false)
    }
  }, [])

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true)

      // Create a new conversation if none exists
      let currentConversationId = conversationId
      if (!currentConversationId) {
        const result = await createConversationAction()
        if (!result.isSuccess) {
          console.error("Failed to create conversation")
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
          createdAt: new Date(userMessage.createdAt)
        },
        {
          id: uuidv4(),
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: new Date(assistantMessage.createdAt)
        }
      ])

      // Trigger list refresh after first message exchange (when title is generated)
      if (messages.length === 0) {
        setShouldRefreshList(true)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // You might want to show an error toast here
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectConversation = useCallback(async (id: string) => {
    if (id === conversationId || isLoadingConversation) return
    setConversationId(id)
    await loadMessages(id)
  }, [conversationId, isLoadingConversation, loadMessages])

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
          isLoading={isLoading || isLoadingConversation}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}