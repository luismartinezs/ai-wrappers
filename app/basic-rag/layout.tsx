"use client"

import { RagProvider } from "@/modules/basic-rag/client/rag-context"

export default function BasicRagLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <RagProvider>{children}</RagProvider>
}