"use client"

import { useSearchParams } from "next/navigation"
import { Link } from "@/shared/components/link"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

export function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication"

  switch (error) {
    case "Configuration":
      errorMessage = "There is a problem with the server configuration."
      break
    case "AccessDenied":
      errorMessage = "You do not have permission to sign in."
      break
    case "Verification":
      errorMessage = "The verification token has expired or has already been used."
      break
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "EmailCreateAccount":
    case "Callback":
      errorMessage = "There was a problem with the authentication service."
      break
    case "OAuthAccountNotLinked":
      errorMessage =
        "This email is already associated with another account. Please sign in with the original provider."
      break
    case "EmailSignin":
      errorMessage = "The e-mail could not be sent."
      break
    case "CredentialsSignin":
      errorMessage = "Invalid email or password."
      break
    case "SessionRequired":
      errorMessage = "Please sign in to access this page."
      break
    default:
      errorMessage = "An unknown error occurred."
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-red-500">
            Authentication Error
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>

          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}