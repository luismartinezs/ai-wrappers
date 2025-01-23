"use server"

import { ObjectId } from "mongodb"
import { getCollection } from "@/modules/mongodb/server/mongodb-utils"
import { CreateRagMessageInput, RAG_MESSAGES_COLLECTION, SerializedRagMessage } from "../models/message"

export async function createMessageAction(
  input: CreateRagMessageInput
): Promise<{ success: boolean; message: string; data?: SerializedRagMessage }> {
  try {
    const collection = await getCollection(RAG_MESSAGES_COLLECTION)

    const messageDoc = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(messageDoc)

    if (!result.insertedId) {
      throw new Error("Failed to insert message")
    }

    const createdMessage = {
      ...messageDoc,
      _id: result.insertedId.toString(),
      createdAt: messageDoc.createdAt.toISOString(),
      updatedAt: messageDoc.updatedAt.toISOString()
    }

    return {
      success: true,
      message: "Message created successfully",
      data: createdMessage as SerializedRagMessage
    }
  } catch (error) {
    console.error("Error creating message:", error)
    return { success: false, message: "Failed to create message" }
  }
}