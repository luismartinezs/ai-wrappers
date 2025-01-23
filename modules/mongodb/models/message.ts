import { Document, ObjectId } from "mongodb"

export interface MessageModel extends Document {
  _id: ObjectId
  chatId: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: Date
  updatedAt: Date
}

export type CreateMessageInput = Omit<MessageModel, "_id" | "createdAt" | "updatedAt">