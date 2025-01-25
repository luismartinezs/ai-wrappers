"use client"

import { AuthWrapper } from "@/shared/components/auth-wrapper"
import { RagLayout } from "@/modules/basic-rag/client/rag-layout"

export default function BasicRagPage() {
  return (
    <AuthWrapper maxWidth="full" className="p-0">
      <RagLayout />
    </AuthWrapper>
  )
}