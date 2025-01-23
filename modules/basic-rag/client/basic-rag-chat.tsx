"use client"

import React, { useState } from "react"
import { useRag } from "../context/rag-context"
import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"
import { Card } from "@/shared/components/ui/card"
import { FolderPlus } from "lucide-react"

export function BasicRagChat() {
  const { selectedNamespace } = useRag()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  if (!selectedNamespace) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
        <FolderPlus className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold mb-2">No Namespace Selected</h3>
        <p className="text-muted-foreground mb-4">
          Select or create a namespace to start chatting. Each namespace represents a separate context
          for your conversations.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      // TODO: Implement the RAG chat action
      setMessages(prev => [...prev, { role: "assistant", content: "RAG response coming soon!" }])
    } catch (error) {
      console.error("Error in RAG chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <Card className="p-4 flex-1 min-h-[400px] max-h-[600px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-12"
                  : "bg-muted mr-12"
              }`}
            >
              {message.content}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              Start a conversation in the {selectedNamespace.name} namespace
            </div>
          )}
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1"
          rows={3}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Thinking..." : "Send"}
        </Button>
      </form>
    </div>
  )
}