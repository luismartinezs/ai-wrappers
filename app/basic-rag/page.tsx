"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PageWrapper } from "@/shared/components/page-wrapper"
import { RagLayout } from "@/modules/basic-rag/client/rag-layout"
import { Button } from "@/shared/components/ui/button"

export default function BasicRagPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoading = status === "loading"

  if (isLoading) {
    return (
      <PageWrapper maxWidth="full">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Button disabled>Loading...</Button>
        </div>
      </PageWrapper>
    )
  }

  if (!session) {
    return (
      <PageWrapper maxWidth="full">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
          <h1 className="text-4xl font-bold text-center">Authentication Required</h1>
          <p className="text-muted-foreground text-center">
            Please sign in to access the Basic RAG Demo
          </p>
          <Button
            onClick={() => router.push("/auth/signin?next=/basic-rag")}
          >
            Sign In to Continue
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper maxWidth="full" className="p-0">
      <RagLayout />
    </PageWrapper>
  )
}