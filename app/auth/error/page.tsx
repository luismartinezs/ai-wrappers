import { AuthError } from "@/modules/auth/client/error"
import { PageWrapper } from "@/shared/components/page-wrapper"

export default function ErrorPage() {
  return (
    <PageWrapper>
      <AuthError />
    </PageWrapper>
  )
}