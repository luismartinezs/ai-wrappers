import { Document, ObjectId } from "mongodb"

export interface ChatModel extends Document {
  _id: ObjectId
  userId: string
  namespaceId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export type CreateChatInput = Omit<ChatModel, "_id" | "createdAt" | "updatedAt">