"use client"

import { AgentMemoryChat } from "@/modules/agent-memory/client/agent-memory-chat"
import { PageWrapper } from "@/shared/components/page-wrapper"

export default function AgentMemoryPage() {
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agent Memory Chat</h1>
        <p className="text-muted-foreground">
          Chat with an AI assistant that has memory of your conversation.
        </p>
      </div>

      <AgentMemoryChat />
    </PageWrapper>
  )
}
