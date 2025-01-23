"use client"
import dynamic from 'next/dynamic'
import { PageWrapper } from "@/shared/components/page-wrapper"

const OpenAIChat = dynamic(
  () => import('@/modules/simple-inference/client/openai-chat').then(mod => mod.OpenAIChat),
  { ssr: false }
)

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