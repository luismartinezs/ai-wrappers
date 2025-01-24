import { DocumentUpload } from "@/modules/basic-rag/document-upload/client/document-upload"
import { RagProvider } from "@/modules/basic-rag/client/rag-context"

export default function DocumentUploadPage() {
  return (
    <RagProvider>
      <div className="flex-1 p-8">
        <DocumentUpload />
      </div>
    </RagProvider>
  )
}