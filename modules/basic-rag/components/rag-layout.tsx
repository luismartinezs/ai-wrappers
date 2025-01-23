"use client"

import { RagSettings } from "./rag-settings"
import { BasicRagChat } from "../client/basic-rag-chat"
import { RagProvider } from "../context/rag-context"

export function RagLayout() {
  return (
    <RagProvider>
      <div className="flex h-[calc(100vh-4rem)]">
        <RagSettings />
        <main className="flex-1 p-6 overflow-auto">
          <BasicRagChat />
        </main>
      </div>
    </RagProvider>
  )
}