import { OpenAIChat } from "@/modules/openai/client/openai-chat"
import { PageWrapper } from "@/shared/components/page-wrapper"

export default function BasicChatPage() {
  return (
    <PageWrapper maxWidth="lg">
      <h1 className="text-4xl font-bold text-center mb-8">
        Chat with OpenAI
      </h1>
      <OpenAIChat />
    </PageWrapper>
  )
}