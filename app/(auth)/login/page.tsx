"use client"

import { useSearchParams } from "next/navigation"
import { AuthButton } from "@/modules/auth/client/auth-button"
import { PageWrapper } from "@/shared/components/page-wrapper"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"

  // Redirect to next URL if already authenticated
  useEffect(() => {
    if (session) {
      router.push(next)
    }
  }, [session, router, next])

  return (
    <PageWrapper maxWidth="sm">
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
        <h1 className="text-4xl font-bold text-center">Sign In</h1>
        <p className="text-muted-foreground text-center">
          Sign in to access all features
        </p>
        <AuthButton />
      </div>
    </PageWrapper>
  )
}