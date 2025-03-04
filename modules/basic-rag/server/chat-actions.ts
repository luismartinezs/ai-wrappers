"use server"

import { getCollection } from "@/modules/mongodb/server/mongodb-utils"
import { RAG_CHATS_COLLECTION, SerializedRagChat } from "../models/chat"
import { ObjectId } from "mongodb"
import { createChatCompletion } from "@/shared/openai/server/openai-lib"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"

interface RagChat {
  _id: ObjectId
  userEmail: string
  namespaceId: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export async function getChatsAction(userEmail: string, namespaceId: string) {
  try {
    const collection = await getCollection<RagChat>(RAG_CHATS_COLLECTION)
    const chats = await collection
      .find({ userEmail, namespaceId })
      .sort({ createdAt: -1 })
      .toArray()

    return {
      success: true as const,
      data: chats.map((chat: RagChat) => ({
        ...chat,
        _id: chat._id.toString(),
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString()
      }))
    }
  } catch (error) {
    console.error("Error getting chats:", error)
    return {
      success: false as const,
      message: "Failed to get chats"
    }
  }
}

async function generateChatTitle(messages: ChatCompletionMessageParam[]): Promise<string> {
  try {
    const prompt: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are a helpful assistant that generates concise, descriptive titles for chat conversations. Generate a title that captures the main topic or intent of the conversation. Keep it under 6 words."
      },
      ...messages
    ]

    const completion = await createChatCompletion(prompt)
    return completion.choices[0].message.content?.trim() || "New Chat"
  } catch (error) {
    console.error("Error generating chat title:", error)
    return "New Chat"
  }
}

export async function updateChatTitleAction(userEmail: string, chatId: string, messages: ChatCompletionMessageParam[]) {
  try {
    const title = await generateChatTitle(messages)
    return await updateChatAction(userEmail, chatId, title)
  } catch (error) {
    console.error("Error updating chat title:", error)
    return {
      success: false as const,
      message: "Failed to update chat title"
    }
  }
}

export async function createChatAction(userEmail: string, namespaceId: string, title: string) {
  try {
    const collection = await getCollection<RagChat>(RAG_CHATS_COLLECTION)
    const now = new Date()
    const chat: RagChat = {
      _id: new ObjectId(),
      userEmail,
      namespaceId,
      title,
      createdAt: now,
      updatedAt: now
    }

    await collection.insertOne(chat)

    return {
      success: true as const,
      data: {
        ...chat,
        _id: chat._id.toString(),
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString()
      }
    }
  } catch (error) {
    console.error("Error creating chat:", error)
    return {
      success: false as const,
      message: "Failed to create chat"
    }
  }
}

export async function updateChatAction(userEmail: string, chatId: string, title: string) {
  try {
    const collection = await getCollection<RagChat>(RAG_CHATS_COLLECTION)
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(chatId), userEmail },
      {
        $set: {
          title,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    )

    if (!result) {
      return {
        success: false as const,
        message: "Chat not found"
      }
    }

    return {
      success: true as const,
      data: {
        ...result,
        _id: result._id.toString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      }
    }
  } catch (error) {
    console.error("Error updating chat:", error)
    return {
      success: false as const,
      message: "Failed to update chat"
    }
  }
}

export async function deleteChatAction(userEmail: string, chatId: string) {
  try {
    const collection = await getCollection<RagChat>(RAG_CHATS_COLLECTION)
    const result = await collection.deleteOne({
      _id: new ObjectId(chatId),
      userEmail
    })

    if (result.deletedCount === 0) {
      return {
        success: false as const,
        message: "Chat not found"
      }
    }

    return {
      success: true as const,
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting chat:", error)
    return {
      success: false as const,
      message: "Failed to delete chat"
    }
  }
}

export type ChatActionResponse<T = any> =
  | { success: true; data: T }
  | { success: false; error: string }