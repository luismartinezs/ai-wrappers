"use client"

import React from "react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { logger } from "@/shared/utils/logger"

export function AuthButton() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isLoading = status === "loading"
  const next = searchParams.get("next") || "/"

  // Debug session state
  React.useEffect(() => {
    logger("auth", "Session state in AuthButton", {
      status,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name
        }
      } : null
    })
  }, [session, status])

  if (isLoading) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {session.user?.name}
        </span>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={() => router.push(`/auth/signin?next=${encodeURIComponent(next)}`)}
    >
      Sign in
    </Button>
  )
}