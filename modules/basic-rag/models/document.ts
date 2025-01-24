export interface DocumentMetadata {
  filename: string
  chunkIndex: number
  totalChunks: number
  start: number
  end: number
}

export interface ProcessingOptions {
  chunkSize: number
  overlapSize: number
  namespace: string
}

export interface UploadResponse {
  success: boolean
  message: string
  totalChunks?: number
  namespace?: string
}

export type SupportedFileType = "text/plain" | "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

export const SUPPORTED_TYPES: SupportedFileType[] = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

export const SUPPORTED_EXTENSIONS = [".txt", ".pdf", ".docx"]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
