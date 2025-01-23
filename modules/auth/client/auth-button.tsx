"use client"

import React from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { useSearchParams } from "next/navigation"

export function AuthButton() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const isLoading = status === "loading"
  const next = searchParams.get("next") || "/"

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
      onClick={() => signIn("google", { callbackUrl: next })}
    >
      Sign in with Google
    </Button>
  )
}