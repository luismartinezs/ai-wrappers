"use server"

import { ProcessingOptions, DocumentMetadata, UploadResponse } from "../models/document"
import { OpenAIEmbeddings } from "@langchain/openai"
import { Document } from "@langchain/core/documents"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx"
import { pineconeClient } from "@/modules/pinecone/server/pinecone-client"
import { logger } from "@/shared/utils/logger"

const PINECONE_INDEX = process.env.PINECONE_INDEX
if (!PINECONE_INDEX) {
  throw new Error("PINECONE_INDEX environment variable is not set")
}

logger("init", "Initializing document processing", { indexName: PINECONE_INDEX })

const embeddings = new OpenAIEmbeddings()

// Get the index instance once
const index = pineconeClient.index(PINECONE_INDEX)

// Helper function to convert to ASCII (remove non-ASCII characters)
function convertToAscii(inputString: string) {
  return inputString.replace(/[^\x00-\x7F]+/g, "")
}

export async function processDocumentAction(
  filesInput: File | File[],
  options: ProcessingOptions
): Promise<UploadResponse> {
  try {
    // Ensure files is always an array
    const files: File[] = Array.isArray(filesInput) ? filesInput : [filesInput]

    logger("process", "Starting batch document processing", {
      fileCount: files.length,
      filenames: files.map((f: File) => f.name),
      options
    })

    // 1. Process all files and collect chunks
    const allChunks: Document[] = []
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: options.chunkSize,
      chunkOverlap: options.overlapSize,
      separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
      keepSeparator: true,
      lengthFunction: (text) => text.length
    })

    // Process each file and collect chunks
    for (const file of files) {
      let text: string
      if (file.type === "application/pdf") {
        const pdfLoader = new PDFLoader(file)
        const docs = await pdfLoader.load()
        text = docs.map(doc => doc.pageContent).join("\n")
        logger("parse", "Parsed PDF document", {
          filename: file.name,
          pages: docs.length,
          textLength: text.length
        })
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const buffer = await file.arrayBuffer()
        const docxLoader = new DocxLoader(new Blob([buffer]))
        const docs = await docxLoader.load()
        text = docs.map(doc => doc.pageContent).join("\n")
        logger("parse", "Parsed DOCX document", {
          filename: file.name,
          pages: docs.length,
          textLength: text.length
        })
      } else {
        text = await file.text()
        logger("parse", "Parsed text document", {
          filename: file.name,
          textLength: text.length
        })
      }

      const fileChunks = await splitter.splitDocuments([
        new Document({
          pageContent: text,
          metadata: {
            filename: file.name,
            source: file.name,
            fileType: file.type
          }
        })
      ])

      allChunks.push(...fileChunks)

      logger("split", `Split document ${file.name} into chunks`, {
        numberOfChunks: fileChunks.length,
        chunkSizes: fileChunks.map(c => c.pageContent.length)
      })
    }

    logger("split", "Completed splitting all documents", {
      totalChunks: allChunks.length,
      averageChunkSize: allChunks.reduce((acc, chunk) => acc + chunk.pageContent.length, 0) / allChunks.length
    })

    // 2. Generate embeddings for all chunks in a single batch
    const texts = allChunks.map(doc => doc.pageContent)
    const embeddingVectors = await embeddings.embedDocuments(texts)
    logger("embed", "Generated embeddings for all documents", {
      numberOfEmbeddings: embeddingVectors.length,
      embeddingDimensions: embeddingVectors[0]?.length
    })

    // 3. Prepare vectors for Pinecone with unique IDs and sanitized metadata
    const timestamp = Date.now().toString() // Convert to string for Pinecone
    const vectors = allChunks.map((chunk, index) => {
      // Ensure metadata values are strings, numbers, or booleans
      const sanitizedMetadata = {
        text: chunk.pageContent,
        filename: chunk.metadata.filename as string,
        source: chunk.metadata.source as string,
        fileType: chunk.metadata.fileType as string,
        chunkIndex: index.toString(), // Convert to string
        totalChunks: allChunks.length.toString(), // Convert to string
        timestamp,
        namespace: options.namespace
      }

      return {
        id: `${options.namespace}-${timestamp}-${index}`,
        values: embeddingVectors[index],
        metadata: sanitizedMetadata
      }
    })

    logger("prepare", "Prepared vectors for all documents", {
      numberOfVectors: vectors.length,
      sampleId: vectors[0]?.id,
      namespace: options.namespace
    })

    // 4. Initialize namespace and upsert all vectors at once
    const namespaceStr = convertToAscii(options.namespace)
    const namespace = index.namespace(namespaceStr)

    // Batch upsert in smaller chunks to avoid request size limits
    const BATCH_SIZE = 100
    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
      const batch = vectors.slice(i, i + BATCH_SIZE)
      await namespace.upsert(batch)
      logger("upsert", `Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}`, {
        batchSize: batch.length,
        totalProcessed: Math.min(i + BATCH_SIZE, vectors.length),
        totalVectors: vectors.length
      })
    }

    logger("upsert", "Completed upserting all vectors to Pinecone", {
      vectorCount: vectors.length,
      namespace: namespaceStr,
      filesProcessed: files.length
    })

    return {
      success: true,
      message: `Successfully processed ${files.length} files with ${allChunks.length} total chunks`,
      totalChunks: allChunks.length,
      namespace: options.namespace
    }
  } catch (error) {
    logger("error", "Error processing documents", {
      error: error instanceof Error ? error.message : 'Unknown error',
      filenames: Array.isArray(filesInput) ? filesInput.map((f: File) => f.name) : [filesInput.name]
    })
    return {
      success: false,
      message: `Failed to process files: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
