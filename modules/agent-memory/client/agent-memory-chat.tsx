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
      logger("agent-memory-chat", "loadConversation triggered", { id: conversationId || 'none' })

      if (!conversationId) {
        logger("agent-memory-chat", "No conversation ID, clearing messages")
        setMessages([])
        return
      }

      try {
        setIsLoading(true)
        logger("agent-memory-chat", "Fetching conversation", { id: conversationId })
        const result = await getConversationAction(conversationId)

        if (!result.isSuccess || !Array.isArray(result.data)) {
          logger("agent-memory-chat", "Failed to get conversation", {
            id: conversationId,
            success: result.isSuccess,
            message: result.message
          })
          setMessages([])
          return
        }

        logger("agent-memory-chat", "Received messages", {
          id: conversationId,
          count: result.data.length
        })

        const formattedMessages = result.data.map((msg) => ({
          id: uuidv4(),
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
        }))

        logger("agent-memory-chat", "Setting formatted messages", {
          id: conversationId,
          count: formattedMessages.length
        })

        setMessages(formattedMessages)
      } catch (error) {
        logger("agent-memory-chat", "Error loading conversation", {
          id: conversationId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
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
        logger("agent-memory-chat", "Creating new conversation")
        const result = await createConversationAction()
        if (!result.isSuccess) {
          logger("agent-memory-chat", "Failed to create conversation", { message: result.message })
          return
        }
        currentConversationId = result.data.id
        setConversationId(currentConversationId)
        setShouldRefreshList(true)
        logger("agent-memory-chat", "Created conversation", { id: currentConversationId })
      }

      logger("agent-memory-chat", "Sending message", { id: currentConversationId })
      const response = await sendMessageAction(currentConversationId, content)

      if (!response.isSuccess) {
        logger("agent-memory-chat", "Failed to send message", { message: response.message })
        throw new Error(response.message)
      }

      // Add both messages to the UI
      const { userMessage, assistantMessage } = response.data
      logger("agent-memory-chat", "Received response", {
        id: currentConversationId,
        userLength: userMessage.content.length,
        assistantLength: assistantMessage.content.length
      })

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
      logger("agent-memory-chat", "Send message error", {
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectConversation = useCallback((id: string) => {
    logger("agent-memory-chat", "Selecting conversation", {
      newId: id,
      currentId: conversationId || 'none',
      loading: isLoading
    })

    if (id === conversationId || isLoading) {
      logger("agent-memory-chat", "Selection skipped", {
        reason: id === conversationId ? "same-id" : "loading"
      })
      return
    }

    setConversationId(id)
  }, [conversationId, isLoading])

  const handleNewChat = useCallback(() => {
    logger("agent-memory-chat", "Starting new chat")
    setConversationId(undefined)
    setMessages([])
  }, [])

  // Log render state
  logger("agent-memory-chat", "Rendering chat", {
    hasConversationId: !!conversationId,
    messageCount: messages.length,
    isLoading
  })

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