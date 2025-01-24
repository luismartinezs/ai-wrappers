"use server"

import { OpenAIEmbeddings } from "@langchain/openai"
import { pineconeClient } from "@/modules/pinecone/server/pinecone-client"
import { ActionState } from "@/shared/types/actions-types"
import { createChatCompletion } from "@/shared/openai/server/openai-lib"
import { logger } from "@/shared/utils/logger"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"

const PINECONE_INDEX = process.env.PINECONE_INDEX
if (!PINECONE_INDEX) {
  throw new Error("PINECONE_INDEX environment variable is not set")
}

// Initialize embeddings model
const embeddings = new OpenAIEmbeddings()

// Get the index instance
const index = pineconeClient.index(PINECONE_INDEX)

// Helper function to convert to ASCII (remove non-ASCII characters)
function convertToAscii(inputString: string) {
  return inputString.replace(/[^\x00-\x7F]+/g, "")
}

interface RetrieveAndGenerateResponse {
  answer: string
  sourceDocs: {
    text: string
    source: string
    filename: string
  }[]
}

export async function retrieveAndGenerateAction(
  query: string,
  namespaceId: string,
  history: ChatCompletionMessageParam[] = []
): Promise<ActionState<RetrieveAndGenerateResponse>> {
  try {
    // 1. Generate embeddings for the query
    const queryEmbedding = await embeddings.embedQuery(query)
    logger("embed", "Generated query embedding", {
      queryLength: query.length,
      embeddingDimensions: queryEmbedding.length
    })

    // 2. Query Pinecone for similar documents
    const namespaceStr = convertToAscii(namespaceId)
    const namespace = index.namespace(namespaceStr)
    const queryResponse = await namespace.query({
      topK: 5,
      vector: queryEmbedding,
      includeMetadata: true
    })

    // 3. Extract and format relevant documents
    const sourceDocs = queryResponse.matches
      .filter((match) => match.score && match.score > 0.7) // Only use documents with high similarity
      .map((match) => ({
        text: match.metadata?.text as string,
        source: match.metadata?.source as string,
        filename: match.metadata?.filename as string
      }))

    // 4. Prepare context for the LLM
    const context = sourceDocs.map((doc) => doc.text).join("\n\n")

    // 5. Prepare messages for the LLM
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a helpful AI assistant. Answer questions based on the provided context.
        If you don't know the answer or can't find it in the context, say so.
        Keep your answers concise and relevant to the question.

        Context:
        ${context}`
      },
      ...history,
      { role: "user", content: query }
    ]

    // 6. Generate response using OpenAI
    const completion = await createChatCompletion(messages)
    const answer = completion.choices[0].message.content || "No response generated"

    return {
      isSuccess: true,
      message: "Successfully retrieved and generated response",
      data: {
        answer,
        sourceDocs
      }
    }
  } catch (error) {
    logger("error", "Error in retrieveAndGenerate", {
      error: error instanceof Error ? error.message : "Unknown error",
      query,
      namespaceId
    })
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to process query"
    }
  }
}