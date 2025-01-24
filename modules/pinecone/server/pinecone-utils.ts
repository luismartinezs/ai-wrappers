"use server"

import { pineconeClient } from "./pinecone-client"
import { Index } from "@pinecone-database/pinecone"

export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX ?? "basic-rag"

// Dimensions: Set to 1536 (required for OpenAI embeddings) or Set to 384 (required for HiggingFace embeddings)
export async function createPineconeIndex(dimension: number = 1536) {
  try {
    // Check if index already exists
    const existingIndexes = await pineconeClient.listIndexes()

    if (Object.values(existingIndexes).some((index: Index) => index.name === PINECONE_INDEX_NAME)) {
      console.log(`Index ${PINECONE_INDEX_NAME} already exists`)
      return
    }

    // Create a new index
    console.log(`Creating index ${PINECONE_INDEX_NAME}...`)

    await pineconeClient.createIndex({
      name: PINECONE_INDEX_NAME,
      dimension, // Default to OpenAI's text-embedding-ada-002 dimensions
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1"
        }
      }
    })

    console.log(`Created index ${PINECONE_INDEX_NAME}`)
  } catch (error) {
    console.error("Error creating Pinecone index:", error)
    throw error
  }
}

export async function deletePineconeIndex() {
  try {
    await pineconeClient.deleteIndex(PINECONE_INDEX_NAME)
    console.log(`Deleted index ${PINECONE_INDEX_NAME}`)
  } catch (error) {
    console.error("Error deleting Pinecone index:", error)
    throw error
  }
}

export async function getPineconeIndex() {
  return pineconeClient.index(PINECONE_INDEX_NAME)
}

export type PineconeDocument = {
  id: string
  values: number[]
  metadata?: Record<string, any>
}