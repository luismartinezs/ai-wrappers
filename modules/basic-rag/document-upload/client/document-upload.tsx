"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Upload, ArrowLeft, Loader2 } from "lucide-react"
import { useRag } from "../../client/rag-context"
import { NamespaceSelector } from "../../client/namespace-selector"
import { Link } from "@/shared/components/link"
import { DocumentSettings, type DocumentSettings as Settings } from "./document-settings"
import { processDocumentAction } from "../../server/document-actions"
import { SUPPORTED_TYPES, MAX_FILE_SIZE } from "../../models/document"
import { toast } from "sonner"
import { Progress } from "@/shared/components/ui/progress"

export function DocumentUpload() {
  const { data: session } = useSession()
  const { selectedNamespace } = useRag()
  const [files, setFiles] = React.useState<FileList | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [processingStatus, setProcessingStatus] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)
  const [settings, setSettings] = React.useState<Settings>({
    chunkSize: 500,
    overlapSize: 50
  })

  // Reset states when files change
  React.useEffect(() => {
    if (files) {
      setUploadProgress(0)
      setProcessingStatus("")
    }
  }, [files])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Validate file types and sizes
      const validFiles = Array.from(e.target.files).filter(file => {
        if (!SUPPORTED_TYPES.includes(file.type as any)) {
          toast.error(`Unsupported file type: ${file.name}`)
          return false
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File too large: ${file.name}`)
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        const dt = new DataTransfer()
        validFiles.forEach(file => dt.items.add(file))
        setFiles(dt.files)
        toast.success(`${validFiles.length} files ready for upload`)
      }
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles) {
      // Validate file types and sizes
      const validFiles = Array.from(droppedFiles).filter(file => {
        if (!SUPPORTED_TYPES.includes(file.type as any)) {
          toast.error(`Unsupported file type: ${file.name}`)
          return false
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File too large: ${file.name}`)
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        const dt = new DataTransfer()
        validFiles.forEach(file => dt.items.add(file))
        setFiles(dt.files)
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || !session?.user?.email || !selectedNamespace) return

    setIsUploading(true)
    setProcessingStatus("Starting upload...")

    try {
      // Process all files at once
      setProcessingStatus("Processing documents...")
      const result = await processDocumentAction(Array.from(files), {
        ...settings,
        namespace: selectedNamespace._id
      })

      if (result.success) {
        setUploadProgress(100)
        setProcessingStatus("Upload complete!")
        toast.success(result.message, {
          description: `Successfully processed ${result.totalChunks} chunks in namespace ${result.namespace}`
        })
      } else {
        setProcessingStatus("Upload failed")
        toast.error("Failed to process documents", {
          description: result.message
        })
      }
    } catch (error) {
      setProcessingStatus("Upload failed")
      toast.error("Error processing documents", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      // Reset states after a delay to show completion
      setTimeout(() => {
        setIsUploading(false)
        setFiles(null)
        setUploadProgress(0)
        setProcessingStatus("")
      }, 2000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        <div>
          <Link
            href="/basic-rag"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Link>

          <h1 className="text-2xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground mt-2">
            Select a namespace and upload your documents
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Select Namespace</h2>
          <NamespaceSelector />
        </div>

        {selectedNamespace && (
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Processing Settings</h2>
              <DocumentSettings onSettingsChange={setSettings} />
            </div>

            <div
              className={`flex flex-col items-center justify-center border-2 ${
                isDragging ? "border-primary" : "border-dashed"
              } rounded-lg p-12 transition-colors relative`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="space-y-4 w-full max-w-md">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-sm font-medium">{processingStatus}</p>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-medium">
                      {isDragging ? "Drop files here" : "Drag & drop files here"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to select files
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supported formats: PDF, TXT, DOCX
                    </p>
                  </div>
                </>
              )}

              {files && files.length > 0 && !isUploading && (
                <div className="mt-4 w-full">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {Array.from(files).map((file, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span>{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!files || isUploading}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Upload Documents"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}