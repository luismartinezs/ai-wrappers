"use server"

import { ObjectId } from "mongodb"
import { getCollection } from "@/modules/mongodb/server/mongodb-utils"
import { CreateRagMessageInput, RAG_MESSAGES_COLLECTION, SerializedRagMessage } from "../models/message"
import { retrieveAndGenerateAction } from "./rag-actions"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { updateChatTitleAction } from "./chat-actions"

export async function createMessageAction(
  input: CreateRagMessageInput
): Promise<{ success: boolean; message: string; data?: SerializedRagMessage }> {
  try {
    const collection = await getCollection(RAG_MESSAGES_COLLECTION)

    // 1. Save user message
    const messageDoc = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(messageDoc)

    if (!result.insertedId) {
      throw new Error("Failed to insert message")
    }

    // 2. Get chat history
    const chatHistory = await collection
      .find({ chatId: input.chatId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // 3. Format history for OpenAI
    const formattedHistory: ChatCompletionMessageParam[] = chatHistory
      .reverse()
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      }))

    // 4. Generate AI response using RAG
    const response = await retrieveAndGenerateAction(
      input.content,
      input.namespaceId,
      formattedHistory
    )

    if (!response.isSuccess) {
      throw new Error(response.message)
    }

    // 5. Save AI response
    const aiMessageDoc = {
      sender: "assistant",
      content: response.data.answer,
      chatId: input.chatId,
      namespaceId: input.namespaceId,
      userEmail: input.userEmail,
      sourceDocs: response.data.sourceDocs,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const aiResult = await collection.insertOne(aiMessageDoc)

    if (!aiResult.insertedId) {
      throw new Error("Failed to insert AI response")
    }

    // 6. Update chat title if this is the first message exchange
    if (chatHistory.length <= 2) {
      await updateChatTitleAction(input.userEmail, input.chatId, formattedHistory)
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

export async function getMessagesAction(chatId: string) {
  try {
    const collection = await getCollection(RAG_MESSAGES_COLLECTION)
    const messages = await collection
      .find({ chatId })
      .sort({ createdAt: 1 })
      .toArray()

    return {
      success: true,
      data: messages.map((msg) => ({
        ...msg,
        _id: msg._id.toString(),
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString()
      })) as SerializedRagMessage[]
    }
  } catch (error) {
    console.error("Error getting messages:", error)
    return { success: false, message: "Failed to get messages" }
  }
}