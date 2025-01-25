"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { PageWrapper } from "@/shared/components/page-wrapper"

interface AuthWrapperProps {
  children: React.ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  className?: string
  redirectPath?: string
}

export function AuthWrapper({
  children,
  maxWidth = "xl",
  className = "",
  redirectPath = "/auth/signin"
}: AuthWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoading = status === "loading"

  if (isLoading) {
    return (
      <PageWrapper maxWidth={maxWidth} className={className}>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Button disabled>Loading...</Button>
        </div>
      </PageWrapper>
    )
  }

  if (!session) {
    return (
      <PageWrapper maxWidth={maxWidth} className={className}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
          <h1 className="text-4xl font-bold text-center">Authentication Required</h1>
          <p className="text-muted-foreground text-center">
            Please sign in to access this page
          </p>
          <Button
            onClick={() => router.push(`${redirectPath}?next=${window.location.pathname}`)}
          >
            Sign In to Continue
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper maxWidth={maxWidth} className={className}>
      {children}
    </PageWrapper>
  )
}
