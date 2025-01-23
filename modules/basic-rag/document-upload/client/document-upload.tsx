"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Upload, ArrowLeft } from "lucide-react"
import { useRag } from "../../client/rag-context"
import { NamespaceSelector } from "../../client/namespace-selector"
import Link from "next/link"

export function DocumentUpload() {
  const { data: session } = useSession()
  const { selectedNamespace } = useRag()
  const [files, setFiles] = React.useState<FileList | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files)
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
      // Filter for supported file types
      const supportedFiles = Array.from(droppedFiles).filter(file => {
        const ext = file.name.toLowerCase().split('.').pop()
        return ['txt', 'pdf', 'doc', 'docx'].includes(ext || '')
      })

      if (supportedFiles.length > 0) {
        const dt = new DataTransfer()
        supportedFiles.forEach(file => dt.items.add(file))
        setFiles(dt.files)
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || !session?.user?.email || !selectedNamespace) return

    setIsUploading(true)
    try {
      // TODO: Implement file upload action
      console.log("Uploading files:", files)
    } finally {
      setIsUploading(false)
      setFiles(null)
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
          <form onSubmit={handleUpload} className="space-y-4">
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
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">
                  {isDragging ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to select files
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: PDF, TXT, DOC, DOCX
                </p>
              </div>

              {files && files.length > 0 && (
                <div className="mt-4 w-full">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {Array.from(files).map((file, i) => (
                      <li key={i}>{file.name}</li>
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
              {isUploading ? "Uploading..." : "Upload Documents"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}