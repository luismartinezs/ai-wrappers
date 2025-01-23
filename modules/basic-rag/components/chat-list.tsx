"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Plus, MessageSquare, Trash2 } from "lucide-react"
import { useRag } from "../context/rag-context"
import { SerializedRagChat } from "../models/chat"
import { getChatsAction, deleteChatAction } from "../server/chat-actions"

export function ChatList() {
  const [chats, setChats] = React.useState<SerializedRagChat[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { data: session } = useSession()
  const { selectedNamespace, selectedChat, setSelectedChat } = useRag()

  const loadChats = React.useCallback(async () => {
    if (!session?.user?.email || !selectedNamespace) {
      setChats([])
      setIsLoading(false)
      return
    }

    const result = await getChatsAction(session.user.email, selectedNamespace._id)
    if (result.success) {
      setChats(result.data)
      // Select the first chat if none is selected
      if (!selectedChat && result.data.length > 0) {
        setSelectedChat(result.data[0])
      }
    }
    setIsLoading(false)
  }, [session?.user?.email, selectedNamespace, selectedChat, setSelectedChat])

  React.useEffect(() => {
    loadChats()
  }, [loadChats])

  const handleNewChat = () => {
    setSelectedChat(null)
  }

  const handleDeleteChat = async (chatId: string) => {
    if (!session?.user?.email) return

    const confirmed = window.confirm("Are you sure you want to delete this chat?")
    if (!confirmed) return

    const result = await deleteChatAction(session.user.email, chatId)
    if (result.success) {
      // If the deleted chat was selected, clear the selection
      if (selectedChat?._id === chatId) {
        setSelectedChat(null)
      }
      loadChats()
    }
  }

  if (!selectedNamespace) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewChat}
          className="hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading chats...</p>
      ) : chats.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No chats yet. Click the + button to start a new chat.
        </p>
      ) : (
        <ul className="space-y-1">
          {chats.map((chat) => (
            <li
              key={chat._id}
              className={`text-sm p-2 rounded-md hover:bg-muted flex items-center justify-between group cursor-pointer ${
                selectedChat?._id === chat._id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteChat(chat._id)
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}