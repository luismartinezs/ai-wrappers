"use client"

import { AgentMemoryChat } from "@/modules/agent-memory/client/agent-memory-chat"
import { AuthWrapper } from "@/shared/components/auth-wrapper"

export default function AgentMemoryPage() {
  return (
    <AuthWrapper>
      <AgentMemoryChat />
    </AuthWrapper>
  )
}
