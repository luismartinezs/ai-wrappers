"use server"

import { ObjectId } from "mongodb"
import { getCollection } from "../server/mongodb-utils"
import { ChatModel, CreateChatInput } from "../models/chat"

const COLLECTION_NAME = "chats"

export async function createChat(chat: CreateChatInput) {
  const collection = await getCollection<ChatModel>(COLLECTION_NAME)
  const now = new Date()

  const doc = {
    ...chat,
    createdAt: now,
    updatedAt: now
  }

  const result = await collection.insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function getChatsByNamespace(namespaceId: string, userId: string) {
  const collection = await getCollection<ChatModel>(COLLECTION_NAME)
  return collection.find({ namespaceId, userId }).toArray()
}

export async function getChatById(_id: string | ObjectId, userId: string) {
  const collection = await getCollection<ChatModel>(COLLECTION_NAME)
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id
  return collection.findOne({ _id: objectId, userId })
}

export async function updateChat(_id: string | ObjectId, userId: string, update: Partial<ChatModel>) {
  const collection = await getCollection<ChatModel>(COLLECTION_NAME)
  const now = new Date()
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id

  return collection.findOneAndUpdate(
    { _id: objectId, userId },
    { $set: { ...update, updatedAt: now } },
    { returnDocument: "after" }
  )
}

export async function deleteChat(_id: string | ObjectId, userId: string) {
  const collection = await getCollection<ChatModel>(COLLECTION_NAME)
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id
  return collection.deleteOne({ _id: objectId, userId })
}