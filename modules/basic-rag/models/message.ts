import { Document, ObjectId } from "mongodb"

export interface RagDocument {
  pageContent: string
  metadata: {
    source: string
  }
}

export interface RagMessageModel extends Document {
  _id: ObjectId
  sender: string
  content: string
  chatId: string
  namespaceId: string
  userEmail: string
  sourceDocs?: RagDocument[]
  createdAt: Date
  updatedAt: Date
}

export type CreateRagMessageInput = Omit<RagMessageModel, "_id" | "createdAt" | "updatedAt">

export interface SerializedRagMessage {
  _id: string
  sender: string
  content: string
  chatId: string
  namespaceId: string
  userEmail: string
  sourceDocs?: RagDocument[]
  createdAt: string
  updatedAt: string
}

export const RAG_MESSAGES_COLLECTION = "rag_messages"
