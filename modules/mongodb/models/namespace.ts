import { Document, ObjectId } from "mongodb"

export interface NamespaceModel extends Document {
  _id: ObjectId
  userId: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateNamespaceInput = Omit<NamespaceModel, "_id" | "createdAt" | "updatedAt">