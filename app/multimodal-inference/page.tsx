import { PageWrapper } from "@/shared/components/page-wrapper"
import MultimodalChat from "@/modules/multimodal-inference/client/multimodal-chat"

export default function MultimodalInferencePage() {
  return (
    <PageWrapper>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">
          Multimodal Inference
        </h1>
        <MultimodalChat />
      </div>
    </PageWrapper>
  )
}