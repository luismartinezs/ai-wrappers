"use client"

import React from "react"
import { SerializedRagNamespace } from "../models/namespace"
import { SerializedRagChat } from "../models/chat"

interface RagContextType {
  selectedNamespace: SerializedRagNamespace | null
  setSelectedNamespace: (namespace: SerializedRagNamespace | null) => void
  selectedChat: SerializedRagChat | null
  setSelectedChat: (chat: SerializedRagChat | null) => void
}

const RagContext = React.createContext<RagContextType | undefined>(undefined)

export function RagProvider({ children }: { children: React.ReactNode }) {
  const [selectedNamespace, setSelectedNamespace] = React.useState<SerializedRagNamespace | null>(null)
  const [selectedChat, setSelectedChat] = React.useState<SerializedRagChat | null>(null)

  // Reset selected chat when namespace changes
  React.useEffect(() => {
    setSelectedChat(null)
  }, [selectedNamespace])

  return (
    <RagContext.Provider
      value={{
        selectedNamespace,
        setSelectedNamespace,
        selectedChat,
        setSelectedChat
      }}
    >
      {children}
    </RagContext.Provider>
  )
}

export function useRag() {
  const context = React.useContext(RagContext)
  if (context === undefined) {
    throw new Error("useRag must be used within a RagProvider")
  }
  return context
}