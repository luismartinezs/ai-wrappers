import { Document, ObjectId } from "mongodb"

// Server-side model
export interface RagNamespaceModel extends Document {
  _id: ObjectId
  userEmail: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Client-side model (serialized)
export interface SerializedRagNamespace {
  _id: string
  userEmail: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type CreateRagNamespaceInput = Omit<RagNamespaceModel, "_id" | "createdAt" | "updatedAt">

export const RAG_NAMESPACES_COLLECTION = "rag_namespaces"