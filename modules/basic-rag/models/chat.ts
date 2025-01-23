import { Document, ObjectId } from "mongodb"

export interface RagChatModel extends Document {
  _id: ObjectId
  namespaceId: string
  userEmail: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export type CreateRagChatInput = Omit<RagChatModel, "_id" | "createdAt" | "updatedAt">

export interface SerializedRagChat {
  _id: string
  userEmail: string
  namespaceId: string
  title: string
  createdAt: string
  updatedAt: string
}

export const RAG_CHATS_COLLECTION = "rag_chats"