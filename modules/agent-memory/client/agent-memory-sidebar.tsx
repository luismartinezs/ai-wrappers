"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { PlusCircle } from "lucide-react"
import { listConversationsAction } from "../server/memory-actions"
import { cn } from "@/shared/utils/cn"

interface Conversation {
  id: string
  title: string
  lastMessageAt: Date
}

interface AgentMemorySidebarProps {
  onSelectConversation: (conversationId: string) => void
  onNewChat: () => void
  currentConversationId?: string
  shouldRefreshList?: boolean
  onListRefreshed?: () => void
}

export function AgentMemorySidebar({
  onSelectConversation,
  onNewChat,
  currentConversationId,
  shouldRefreshList,
  onListRefreshed
}: AgentMemorySidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])

  const loadConversations = useCallback(async () => {
    try {
      const result = await listConversationsAction()
      if (result.isSuccess) {
        setConversations(result.data)
      } else {
        console.error("Failed to load conversations:", result.message)
        setConversations([])
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
      setConversations([])
    }
    onListRefreshed?.()
  }, [onListRefreshed])

  // Initial load
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Refresh when requested
  useEffect(() => {
    if (shouldRefreshList) {
      loadConversations()
    }
  }, [shouldRefreshList, loadConversations])

  return (
    <div className="flex h-full w-80 flex-col border-r">
      <div className="flex items-center gap-2 border-b p-4">
        <Button
          onClick={onNewChat}
          className="flex w-full items-center justify-start gap-2"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-start gap-2 truncate",
                currentConversationId === conversation.id &&
                  "bg-muted hover:bg-muted"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <span className="truncate">{conversation.title}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}